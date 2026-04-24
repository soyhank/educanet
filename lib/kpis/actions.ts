"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { procesarEvento } from "@/lib/gamificacion/motor";
import { getSemanaISO, getAnio, mesActual } from "@/lib/gamificacion/periodo";
import {
  calcularCumplimientoKpis,
  consolidarRegistros,
  calcularCumplimientoIndividual,
  MAX_PUNTOS_KPIS_MES,
} from "./calculo";

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function reportarKpiSemanal(input: {
  asignacionId: string;
  valor: number;
  comentario?: string;
  semanaDelAnio?: number;
  anio?: number;
}): Promise<Result> {
  const user = await requireAuth();

  const asignacion = await prisma.kpiAsignacion.findUnique({
    where: { id: input.asignacionId },
    select: { userId: true, periodoMes: true, periodoAnio: true },
  });
  if (!asignacion) return { success: false, error: "Asignacion no existe" };

  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";
  if (asignacion.userId !== user.id && !esAdmin) {
    return { success: false, error: "No autorizado" };
  }

  const ahora = new Date();
  const semana = input.semanaDelAnio ?? getSemanaISO(ahora).semana;
  const anio = input.anio ?? getAnio(ahora);

  await prisma.kpiRegistroSemanal.upsert({
    where: {
      asignacionId_semanaDelAnio_anio: {
        asignacionId: input.asignacionId,
        semanaDelAnio: semana,
        anio,
      },
    },
    create: {
      asignacionId: input.asignacionId,
      semanaDelAnio: semana,
      anio,
      valor: input.valor,
      comentario: input.comentario ?? null,
      reportadoPorId: user.id,
      estadoValidacion: "PENDIENTE",
    },
    update: {
      valor: input.valor,
      comentario: input.comentario ?? null,
      reportadoPorId: user.id,
      // Reset a PENDIENTE si el empleado corrige su reporte
      estadoValidacion: "PENDIENTE",
      validadoPorId: null,
      validadoEn: null,
      rechazoMotivo: null,
    },
  });

  revalidatePath("/mi-progreso");
  revalidatePath("/mi-progreso/kpis");
  return { success: true };
}

export async function asignarKpisAEmpleado(input: {
  userId: string;
  mes: number;
  anio: number;
  asignaciones: Array<{
    definicionId: string;
    valorObjetivo: number;
    valorBaseline?: number;
    notasInternas?: string;
  }>;
}): Promise<Result> {
  await requireRole(["ADMIN", "RRHH"]);

  await prisma.$transaction(
    input.asignaciones.map((a) =>
      prisma.kpiAsignacion.upsert({
        where: {
          userId_definicionId_periodoMes_periodoAnio: {
            userId: input.userId,
            definicionId: a.definicionId,
            periodoMes: input.mes,
            periodoAnio: input.anio,
          },
        },
        create: {
          userId: input.userId,
          definicionId: a.definicionId,
          periodoMes: input.mes,
          periodoAnio: input.anio,
          valorObjetivo: a.valorObjetivo,
          valorBaseline: a.valorBaseline ?? null,
          notasInternas: a.notasInternas ?? null,
        },
        update: {
          valorObjetivo: a.valorObjetivo,
          valorBaseline: a.valorBaseline ?? null,
          notasInternas: a.notasInternas ?? null,
        },
      })
    )
  );

  revalidatePath("/admin/kpis");
  return { success: true };
}

export async function cerrarMesKpis(input: {
  userId: string;
  mes: number;
  anio: number;
}): Promise<Result<{ puntosTotalOtorgados: number }>> {
  await requireRole(["ADMIN", "RRHH"]);

  const cumplimiento = await calcularCumplimientoKpis({
    userId: input.userId,
    mes: input.mes,
    anio: input.anio,
  });

  let totalOtorgado = 0;

  for (const c of cumplimiento.cumplimientos) {
    const asig = await prisma.kpiAsignacion.findUnique({
      where: { id: c.asignacionId },
      include: {
        definicion: true,
        registros: {
          where: { estadoValidacion: { in: ["VALIDADO", "AUTO_VALIDADO"] } },
        },
      },
    });
    if (!asig) continue;

    const valorConsolidado = consolidarRegistros(
      asig.registros,
      asig.definicion.tipoMeta!
    );
    const cumplIndividual = calcularCumplimientoIndividual(
      valorConsolidado,
      asig.valorObjetivo,
      asig.definicion.tipoMeta!
    );

    const superoMeta = cumplIndividual > 100 && asig.definicion.permiteSupera;
    const bonusPct = superoMeta ? asig.definicion.bonusPorcentaje : 0;

    const puntosBase = Math.floor(
      (Math.min(100, cumplIndividual) / 100) *
        MAX_PUNTOS_KPIS_MES *
        ((asig.definicion.peso ?? 0) / 100)
    );
    const bonus = Math.floor(puntosBase * (bonusPct / 100));
    const puntosTotal = puntosBase + bonus;

    await prisma.kpiResultadoMensual.upsert({
      where: { asignacionId: asig.id },
      create: {
        asignacionId: asig.id,
        valorConsolidado,
        porcentajeCumplimiento: cumplIndividual,
        superoMeta,
        puntosOtorgados: puntosTotal,
        incluyeBonus: bonus > 0,
      },
      update: {
        valorConsolidado,
        porcentajeCumplimiento: cumplIndividual,
        superoMeta,
        puntosOtorgados: puntosTotal,
        incluyeBonus: bonus > 0,
      },
    });

    if (puntosTotal > 0) {
      await procesarEvento({
        userId: input.userId,
        tipo: "KPI_MES_CUMPLIDO",
        fuente: "KPIS",
        puntosBrutos: puntosTotal,
        referenciaId: asig.id,
        descripcion: `KPI "${asig.definicion.nombre}" cierre ${input.mes}/${input.anio}`,
        fecha: new Date(input.anio, input.mes - 1, 28),
      });
      totalOtorgado += puntosTotal;
    }
  }

  await prisma.notificacion.create({
    data: {
      userId: input.userId,
      tipo: "LOGRO",
      titulo: `Cierre de KPIs ${input.mes}/${input.anio}`,
      mensaje: `Cumplimiento: ${cumplimiento.porcentaje.toFixed(0)}%. Puntos otorgados: ${totalOtorgado}.`,
      url: "/mi-progreso",
    },
  });

  revalidatePath("/mi-progreso");
  revalidatePath("/admin/kpis");

  return { success: true, data: { puntosTotalOtorgados: totalOtorgado } };
}

export async function crearDefinicionKpi(input: {
  puestoId: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  peso: number;
  tipoMeta: "ABSOLUTA" | "RELATIVA_BASELINE" | "BINARIA";
  valorObjetivoDefault?: number;
  bonusPorcentaje?: number;
}): Promise<Result> {
  await requireRole(["ADMIN", "RRHH"]);
  await prisma.puestoKpiDefinicion.create({
    data: {
      puestoId: input.puestoId,
      codigo: input.codigo,
      nombre: input.nombre,
      descripcion: input.descripcion,
      unidad: input.unidad,
      peso: input.peso,
      tipoMeta: input.tipoMeta,
      valorObjetivoDefault: input.valorObjetivoDefault ?? null,
      bonusPorcentaje: input.bonusPorcentaje ?? 15,
    },
  });
  revalidatePath("/admin/kpis");
  return { success: true };
}

export async function actualizarDefinicionKpi(
  id: string,
  data: Partial<{
    nombre: string;
    descripcion: string;
    unidad: string;
    peso: number;
    valorObjetivoDefault: number | null;
    bonusPorcentaje: number;
    activa: boolean;
  }>
): Promise<Result> {
  await requireRole(["ADMIN", "RRHH"]);
  await prisma.puestoKpiDefinicion.update({ where: { id }, data });

  // Re-aplicar nuevo objetivo al mes actual si cambió
  if (data.valorObjetivoDefault != null) {
    const { mes, anio } = mesActual();
    await prisma.kpiAsignacion.updateMany({
      where: { definicionId: id, periodoMes: mes, periodoAnio: anio },
      data: { valorObjetivo: data.valorObjetivoDefault },
    });
  }

  revalidatePath("/admin/kpis");
  revalidatePath("/mi-equipo/kpis");
  return { success: true };
}

export async function actualizarObjetivoRolMesAction(input: {
  definicionId: string;
  valorObjetivo: number;
}): Promise<Result> {
  const user = await requireAuth();
  const esJefe = user.puesto?.nombre?.startsWith("Jefe") ?? false;
  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";
  if (!esJefe && !esAdmin) return { success: false, error: "Sin permiso" };

  const { mes, anio } = mesActual();

  await prisma.puestoKpiDefinicion.update({
    where: { id: input.definicionId },
    data: { valorObjetivoDefault: input.valorObjetivo },
  });

  await prisma.kpiAsignacion.updateMany({
    where: { definicionId: input.definicionId, periodoMes: mes, periodoAnio: anio },
    data: { valorObjetivo: input.valorObjetivo },
  });

  revalidatePath("/mi-equipo/kpis");
  revalidatePath("/admin/kpis");
  return { success: true };
}

export async function eliminarDefinicionKpi(id: string): Promise<Result> {
  await requireRole(["ADMIN"]);
  try {
    await prisma.puestoKpiDefinicion.delete({ where: { id } });
  } catch {
    return {
      success: false,
      error:
        "No se puede eliminar: la definicion tiene asignaciones activas. Desactivala en su lugar.",
    };
  }
  revalidatePath("/admin/kpis");
  return { success: true };
}

export async function validarRegistroKpi(params: {
  registroId: string;
  aprobar: boolean;
  comentario?: string;
  valorCorregido?: number;
}): Promise<Result> {
  const user = await requireAuth();

  const registro = await prisma.kpiRegistroSemanal.findUnique({
    where: { id: params.registroId },
    include: { asignacion: { include: { user: true } } },
  });
  if (!registro) return { success: false, error: "Registro no encontrado" };

  const { verificarEsJefeDe } = await import("./jerarquia");
  const esJefe = await verificarEsJefeDe(user.id, registro.asignacion.userId);
  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";

  if (!esJefe && !esAdmin) {
    return { success: false, error: "Solo el jefe puede validar este KPI" };
  }

  const valorFinal = params.valorCorregido ?? registro.valor;

  await prisma.kpiRegistroSemanal.update({
    where: { id: params.registroId },
    data: {
      valor: valorFinal,
      estadoValidacion: params.aprobar ? "VALIDADO" : "RECHAZADO",
      validadoPorId: user.id,
      validadoEn: new Date(),
      comentarioValidacion: params.comentario ?? null,
      rechazoMotivo: !params.aprobar ? (params.comentario ?? null) : null,
    },
  });

  await prisma.notificacion.create({
    data: {
      userId: registro.asignacion.userId,
      tipo: "SISTEMA",
      titulo: params.aprobar ? "KPI validado" : "KPI rechazado",
      mensaje: params.aprobar
        ? `Tu reporte fue validado${params.valorCorregido !== undefined ? " (valor ajustado)" : ""}`
        : `Motivo: ${params.comentario ?? "sin comentario"}`,
      url: "/mi-progreso/kpis",
    },
  });

  revalidatePath("/mi-equipo/kpis");
  revalidatePath("/mi-progreso/kpis");

  return { success: true };
}

export async function reportarKpiPorJefe(params: {
  asignacionId: string;
  semana: number;
  anio: number;
  valor: number;
  comentario?: string;
}): Promise<Result> {
  const user = await requireAuth();

  const asignacion = await prisma.kpiAsignacion.findUnique({
    where: { id: params.asignacionId },
    include: { definicion: true },
  });
  if (!asignacion) return { success: false, error: "Asignacion no encontrada" };

  if (asignacion.definicion.tipoFuente !== "EVALUADO_POR_JEFE") {
    return { success: false, error: "Este KPI no es evaluado por jefe" };
  }

  const { verificarEsJefeDe } = await import("./jerarquia");
  const esJefe = await verificarEsJefeDe(user.id, asignacion.userId);
  if (!esJefe && user.rol !== "ADMIN" && user.rol !== "RRHH") {
    return { success: false, error: "Solo el jefe puede reportar este KPI" };
  }

  await prisma.kpiRegistroSemanal.upsert({
    where: {
      asignacionId_semanaDelAnio_anio: {
        asignacionId: params.asignacionId,
        semanaDelAnio: params.semana,
        anio: params.anio,
      },
    },
    create: {
      asignacionId: params.asignacionId,
      semanaDelAnio: params.semana,
      anio: params.anio,
      valor: params.valor,
      comentario: params.comentario ?? null,
      reportadoPorId: user.id,
      estadoValidacion: "VALIDADO",
      validadoPorId: user.id,
      validadoEn: new Date(),
    },
    update: {
      valor: params.valor,
      comentario: params.comentario ?? null,
      reportadoPorId: user.id,
      estadoValidacion: "VALIDADO",
      validadoPorId: user.id,
      validadoEn: new Date(),
    },
  });

  revalidatePath("/mi-equipo/kpis");
  return { success: true };
}
