"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { procesarEvento } from "@/lib/gamificacion/motor";
import { getSemanaISO } from "@/lib/gamificacion/periodo";
import { obtenerJefeUser } from "./jerarquia";
import { PUNTOS_COMPROMISO } from "./constantes";

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const compromisoSchema = z.object({
  titulo: z.string().min(5, "Minimo 5 caracteres").max(200, "Maximo 200"),
  descripcion: z.string().max(500).optional(),
  fechaLimite: z.date(),
});

function validarFechaLimite(iso: string): { ok: true; fecha: Date } | { ok: false; error: string } {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return { ok: false, error: "Fecha invalida" };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) return { ok: false, error: "La fecha limite no puede ser pasada" };
  return { ok: true, fecha };
}

/**
 * Empleado propone un compromiso para si mismo.
 * Queda en estado PROPUESTO esperando aprobacion del jefe.
 */
export async function proponerCompromiso(input: {
  titulo: string;
  descripcion?: string;
  fechaLimite: string;
}): Promise<Result<{ id: string }>> {
  const user = await requireAuth();

  const fechaCheck = validarFechaLimite(input.fechaLimite);
  if (!fechaCheck.ok) return { success: false, error: fechaCheck.error };

  const parsed = compromisoSchema.safeParse({
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    fechaLimite: fechaCheck.fecha,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { semana, anio } = getSemanaISO(new Date());

  const compromiso = await prisma.compromiso.create({
    data: {
      userId: user.id,
      asignadoPorId: null,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion ?? null,
      fechaLimite: parsed.data.fechaLimite,
      semanaDelAnio: semana,
      anio,
      estado: "PROPUESTO",
    },
  });

  // Notificar al jefe
  const jefe = await obtenerJefeUser(user.id);
  if (jefe) {
    await prisma.notificacion.create({
      data: {
        userId: jefe.id,
        tipo: "LOGRO",
        titulo: "Nueva propuesta de compromiso",
        mensaje: `${user.nombre} ${user.apellido} propone: "${parsed.data.titulo}"`,
        url: "/mi-equipo",
      },
    });
  }

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true, data: { id: compromiso.id } };
}

/**
 * Jefe (o admin) asigna un compromiso directamente a un miembro del equipo.
 * Queda en estado PENDIENTE, listo para que el empleado lo cumpla.
 */
export async function asignarCompromisoAMiembro(input: {
  userId: string;
  titulo: string;
  descripcion?: string;
  fechaLimite: string;
}): Promise<Result<{ id: string }>> {
  const asignador = await requireAuth();
  const esAdmin = asignador.rol === "ADMIN" || asignador.rol === "RRHH";

  // Verificar que el asignador es jefe del user target o admin
  if (!esAdmin) {
    const jefeDelTarget = await obtenerJefeUser(input.userId);
    if (!jefeDelTarget || jefeDelTarget.id !== asignador.id) {
      return { success: false, error: "Solo el jefe del miembro o admin puede asignar" };
    }
  }

  const fechaCheck = validarFechaLimite(input.fechaLimite);
  if (!fechaCheck.ok) return { success: false, error: fechaCheck.error };

  const parsed = compromisoSchema.safeParse({
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    fechaLimite: fechaCheck.fecha,
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const target = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, nombre: true },
  });
  if (!target) return { success: false, error: "Miembro no existe" };

  const { semana, anio } = getSemanaISO(new Date());

  const compromiso = await prisma.compromiso.create({
    data: {
      userId: input.userId,
      asignadoPorId: asignador.id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion ?? null,
      fechaLimite: parsed.data.fechaLimite,
      semanaDelAnio: semana,
      anio,
      estado: "PENDIENTE",
    },
  });

  await prisma.notificacion.create({
    data: {
      userId: input.userId,
      tipo: "LOGRO",
      titulo: "Nuevo compromiso asignado",
      mensaje: `${asignador.nombre} te asigno: "${parsed.data.titulo}"`,
      url: "/compromisos",
    },
  });

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true, data: { id: compromiso.id } };
}

/**
 * Jefe aprueba una propuesta del empleado. Estado PROPUESTO -> PENDIENTE.
 */
export async function aprobarPropuestaCompromiso(
  compromisoId: string
): Promise<Result> {
  const aprobador = await requireAuth();
  const esAdmin = aprobador.rol === "ADMIN" || aprobador.rol === "RRHH";

  const c = await prisma.compromiso.findUnique({
    where: { id: compromisoId },
    select: { userId: true, estado: true, titulo: true },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado !== "PROPUESTO") {
    return { success: false, error: "No es una propuesta pendiente" };
  }

  if (!esAdmin) {
    const jefe = await obtenerJefeUser(c.userId);
    if (!jefe || jefe.id !== aprobador.id) {
      return { success: false, error: "Solo el jefe puede aprobar propuestas" };
    }
  }

  await prisma.compromiso.update({
    where: { id: compromisoId },
    data: {
      estado: "PENDIENTE",
      asignadoPorId: aprobador.id,
    },
  });

  await prisma.notificacion.create({
    data: {
      userId: c.userId,
      tipo: "LOGRO",
      titulo: "Propuesta aprobada",
      mensaje: `Tu propuesta "${c.titulo}" fue aprobada. Adelante!`,
      url: "/compromisos",
    },
  });

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

/**
 * Jefe rechaza una propuesta. Se elimina el compromiso.
 */
export async function rechazarPropuestaCompromiso(input: {
  compromisoId: string;
  motivo: string;
}): Promise<Result> {
  const rechazador = await requireAuth();
  const esAdmin = rechazador.rol === "ADMIN" || rechazador.rol === "RRHH";

  const c = await prisma.compromiso.findUnique({
    where: { id: input.compromisoId },
    select: { userId: true, estado: true, titulo: true },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado !== "PROPUESTO") {
    return { success: false, error: "No es una propuesta pendiente" };
  }

  if (!esAdmin) {
    const jefe = await obtenerJefeUser(c.userId);
    if (!jefe || jefe.id !== rechazador.id) {
      return { success: false, error: "Solo el jefe puede rechazar propuestas" };
    }
  }

  await prisma.compromiso.delete({ where: { id: input.compromisoId } });

  await prisma.notificacion.create({
    data: {
      userId: c.userId,
      tipo: "SISTEMA",
      titulo: "Propuesta no aprobada",
      mensaje: `"${c.titulo}": ${input.motivo}`,
      url: "/compromisos",
    },
  });

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

/**
 * Jefe edita un compromiso existente (titulo, descripcion, fechaLimite).
 * Permitido en cualquier estado excepto CUMPLIDO o NO_CUMPLIDO.
 */
export async function editarCompromiso(input: {
  compromisoId: string;
  titulo?: string;
  descripcion?: string | null;
  fechaLimite?: string;
}): Promise<Result> {
  const editor = await requireAuth();
  const esAdmin = editor.rol === "ADMIN" || editor.rol === "RRHH";

  const c = await prisma.compromiso.findUnique({
    where: { id: input.compromisoId },
    select: { userId: true, estado: true },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado === "CUMPLIDO" || c.estado === "NO_CUMPLIDO") {
    return { success: false, error: "No se puede editar un compromiso ya resuelto" };
  }

  if (!esAdmin) {
    const jefe = await obtenerJefeUser(c.userId);
    if (!jefe || jefe.id !== editor.id) {
      return { success: false, error: "Solo el jefe puede editar" };
    }
  }

  const data: Record<string, unknown> = {};
  if (input.titulo !== undefined) {
    const t = input.titulo.trim();
    if (t.length < 5 || t.length > 200)
      return { success: false, error: "Titulo 5-200 caracteres" };
    data.titulo = t;
  }
  if (input.descripcion !== undefined) {
    data.descripcion = input.descripcion?.trim() || null;
  }
  if (input.fechaLimite !== undefined) {
    const check = validarFechaLimite(input.fechaLimite);
    if (!check.ok) return { success: false, error: check.error };
    data.fechaLimite = check.fecha;
  }

  await prisma.compromiso.update({
    where: { id: input.compromisoId },
    data,
  });

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

export async function marcarCumplido(id: string): Promise<Result> {
  const user = await requireAuth();
  const c = await prisma.compromiso.findUnique({ where: { id } });
  if (!c) return { success: false, error: "No existe" };
  if (c.userId !== user.id) return { success: false, error: "No autorizado" };
  if (c.estado !== "PENDIENTE") {
    return {
      success: false,
      error: "Solo se marcan compromisos aprobados y pendientes",
    };
  }

  await prisma.compromiso.update({
    where: { id },
    data: {
      autoReportadoCumplido: true,
      fechaCumplimiento: new Date(),
      estado: "CUMPLIDO_AUTO",
    },
  });

  const jefe = await obtenerJefeUser(user.id);
  if (jefe) {
    await prisma.notificacion.create({
      data: {
        userId: jefe.id,
        tipo: "LOGRO",
        titulo: "Compromiso pendiente de validacion",
        mensaje: `${user.nombre} ${user.apellido}: "${c.titulo}"`,
        url: "/mi-equipo",
      },
    });
  }

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

/**
 * Eliminar compromiso. Permitido en:
 * - PROPUESTO: el propio empleado o su jefe/admin
 * - PENDIENTE: solo el jefe que lo asigno o admin
 */
export async function eliminarCompromiso(id: string): Promise<Result> {
  const user = await requireAuth();
  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";

  const c = await prisma.compromiso.findUnique({
    where: { id },
    select: { userId: true, asignadoPorId: true, estado: true },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado === "CUMPLIDO" || c.estado === "CUMPLIDO_AUTO") {
    return { success: false, error: "No se elimina un compromiso ya cumplido" };
  }

  const esPropio = c.userId === user.id;
  const esJefeDelTarget = c.asignadoPorId === user.id;

  if (!esAdmin && !esPropio && !esJefeDelTarget) {
    return { success: false, error: "No autorizado" };
  }
  // Si es propio pero ya en PENDIENTE (aprobado), no puede eliminarlo
  if (esPropio && !esAdmin && c.estado !== "PROPUESTO") {
    return { success: false, error: "Solo el jefe puede eliminar compromisos aprobados" };
  }

  await prisma.compromiso.delete({ where: { id } });
  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

function puntosSegunTiming(fechaCumplimiento: Date, fechaLimite: Date): number {
  const aTiempo = fechaCumplimiento.getTime() <= fechaLimite.getTime();
  return aTiempo
    ? PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO
    : PUNTOS_COMPROMISO.CON_RETRASO;
}

export async function validarCompromiso(input: {
  compromisoId: string;
  aprobar: boolean;
  comentario?: string;
}): Promise<Result> {
  const validador = await requireAuth();

  const c = await prisma.compromiso.findUnique({
    where: { id: input.compromisoId },
    include: {
      user: { select: { id: true, nombre: true, apellido: true } },
    },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado !== "CUMPLIDO_AUTO") {
    return { success: false, error: "No hay nada que validar en este estado" };
  }

  const esAdmin = validador.rol === "ADMIN" || validador.rol === "RRHH";
  if (!esAdmin) {
    const jefe = await obtenerJefeUser(c.userId);
    if (!jefe || jefe.id !== validador.id) {
      return { success: false, error: "Solo tu jefe puede validar" };
    }
  }

  if (input.aprobar) {
    const puntos =
      c.fechaCumplimiento && c.fechaLimite
        ? puntosSegunTiming(c.fechaCumplimiento, c.fechaLimite)
        : PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO;

    await prisma.compromiso.update({
      where: { id: input.compromisoId },
      data: {
        estado: "CUMPLIDO",
        validadoPorId: validador.id,
        validadoEn: new Date(),
        validacionComentario: input.comentario ?? null,
        puntosOtorgados: puntos,
      },
    });

    await procesarEvento({
      userId: c.userId,
      tipo: "COMPROMISO_CUMPLIDO",
      fuente: "COMPROMISOS",
      puntosBrutos: puntos,
      referenciaId: c.id,
      descripcion: `Compromiso: ${c.titulo}`,
    });

    await prisma.notificacion.create({
      data: {
        userId: c.userId,
        tipo: "LOGRO",
        titulo: "Compromiso validado",
        mensaje: `"${c.titulo}" · +${puntos} pts`,
        url: "/compromisos",
      },
    });
  } else {
    await prisma.compromiso.update({
      where: { id: input.compromisoId },
      data: {
        estado: "NO_CUMPLIDO",
        validadoPorId: validador.id,
        validadoEn: new Date(),
        validacionComentario: input.comentario ?? null,
        puntosOtorgados: 0,
      },
    });

    await prisma.notificacion.create({
      data: {
        userId: c.userId,
        tipo: "SISTEMA",
        titulo: "Compromiso no validado",
        mensaje: `"${c.titulo}" · ${input.comentario ?? "Revisalo con tu jefe"}`,
        url: "/compromisos",
      },
    });
  }

  revalidatePath("/compromisos");
  revalidatePath("/mi-equipo");
  return { success: true };
}

export async function autoValidarCompromisos(): Promise<{
  autoValidados: number;
  atrasados: number;
}> {
  await requireRole(["ADMIN", "RRHH"]);

  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const paraAutoValidar = await prisma.compromiso.findMany({
    where: {
      estado: "CUMPLIDO_AUTO",
      fechaCumplimiento: { lte: hace7Dias },
    },
    select: {
      id: true,
      userId: true,
      titulo: true,
      fechaCumplimiento: true,
      fechaLimite: true,
    },
  });

  let autoValidados = 0;
  for (const c of paraAutoValidar) {
    const aTiempo = c.fechaCumplimiento!.getTime() <= c.fechaLimite.getTime();
    const puntos = aTiempo
      ? PUNTOS_COMPROMISO.A_TIEMPO_AUTO
      : PUNTOS_COMPROMISO.CON_RETRASO;

    await prisma.compromiso.update({
      where: { id: c.id },
      data: {
        estado: "CUMPLIDO",
        validadoEn: new Date(),
        validacionComentario: "Auto-validado tras 7 dias sin revision",
        puntosOtorgados: puntos,
      },
    });

    await procesarEvento({
      userId: c.userId,
      tipo: "COMPROMISO_CUMPLIDO",
      fuente: "COMPROMISOS",
      puntosBrutos: puntos,
      referenciaId: c.id,
      descripcion: `Compromiso auto-validado: ${c.titulo}`,
    });
    autoValidados++;
  }

  const ahora = new Date();
  const atrasadosRes = await prisma.compromiso.updateMany({
    where: {
      estado: "PENDIENTE",
      fechaLimite: { lt: ahora },
    },
    data: { estado: "ATRASADO" },
  });

  return { autoValidados, atrasados: atrasadosRes.count };
}
