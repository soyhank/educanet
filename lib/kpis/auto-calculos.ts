import { prisma } from "@/lib/prisma";
import { rangoMes } from "@/lib/gamificacion/periodo";
import { differenceInDays, differenceInHours } from "date-fns";

type CalcParams = { userId: string; mes: number; anio: number };
type CalcResult = { valor: number; snapshot: Record<string, unknown> };

export async function calcularKpiCalidadChecklists(
  params: CalcParams
): Promise<CalcResult> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);

  const tareas = await prisma.tareaInstancia.findMany({
    where: {
      OR: [
        { asignadoAId: params.userId },
        { ejecutadaRealmenteId: params.userId },
      ],
      estado: "COMPLETADA",
      completadaEn: { gte: inicio, lte: fin },
    },
    include: {
      catalogoTarea: { include: { checklistItems: true } },
      checklistMarcados: true,
    },
  });

  if (tareas.length === 0) {
    return { valor: 0, snapshot: { sinData: true } };
  }

  let completasAl100 = 0;
  for (const tarea of tareas) {
    const obligatorios =
      tarea.catalogoTarea?.checklistItems.filter((i) => i.obligatorio) ?? [];
    if (obligatorios.length === 0) {
      completasAl100++;
      continue;
    }
    const marcadosOk = tarea.checklistMarcados.filter(
      (m) => m.marcado && obligatorios.some((o) => o.id === m.plantillaItemId)
    );
    if (marcadosOk.length === obligatorios.length) completasAl100++;
  }

  const valor = (completasAl100 / tareas.length) * 100;
  return {
    valor,
    snapshot: {
      totalTareas: tareas.length,
      completasAl100,
      porcentaje: valor,
    },
  };
}

export async function calcularKpiAnticipacion48h(
  params: CalcParams
): Promise<CalcResult> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);

  const tareas = await prisma.tareaInstancia.findMany({
    where: {
      OR: [
        { asignadoAId: params.userId },
        { ejecutadaRealmenteId: params.userId },
      ],
      estado: "COMPLETADA",
      completadaEn: { gte: inicio, lte: fin },
      catalogoTarea: { categoria: "PRE_WEBINAR" },
    },
    include: { workflowInstancia: true },
  });

  if (tareas.length === 0) {
    return { valor: 100, snapshot: { sinData: true } };
  }

  const aTiempo = tareas.filter((t) => {
    if (!t.completadaEn || !t.workflowInstancia?.fechaHito) return false;
    return (
      differenceInHours(t.workflowInstancia.fechaHito, t.completadaEn) >= 48
    );
  });

  return {
    valor: (aTiempo.length / tareas.length) * 100,
    snapshot: { totalPreWebinar: tareas.length, aTiempo: aTiempo.length },
  };
}

export async function calcularKpiResolucionBloqueos(
  params: CalcParams
): Promise<CalcResult> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);

  const bloqueos = await prisma.tareaInstancia.findMany({
    where: {
      OR: [
        { asignadoAId: params.userId },
        { ejecutadaRealmenteId: params.userId },
      ],
      bloqueoExternoDesde: { not: null, gte: inicio },
      bloqueoExternoHasta: { not: null, lte: fin },
    },
  });

  if (bloqueos.length === 0) {
    return { valor: 0, snapshot: { sinBloqueos: true } };
  }

  const diasPromedio =
    bloqueos.reduce((sum, t) => {
      return (
        sum +
        differenceInDays(t.bloqueoExternoHasta!, t.bloqueoExternoDesde!)
      );
    }, 0) / bloqueos.length;

  return {
    valor: diasPromedio,
    snapshot: { bloqueosResueltos: bloqueos.length, diasPromedio },
  };
}

export async function calcularKpiAyudasCruzadas(
  params: CalcParams
): Promise<CalcResult> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);

  const ayudas = await prisma.tareaInstancia.count({
    where: {
      ejecutadaRealmenteId: params.userId,
      asignadoAId: { not: params.userId },
      estado: "COMPLETADA",
      completadaEn: { gte: inicio, lte: fin },
    },
  });

  return { valor: ayudas, snapshot: { totalAyudas: ayudas } };
}

export async function calcularKpiReportePostEvento(
  params: CalcParams
): Promise<CalcResult> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);

  const reportes = await prisma.tareaInstancia.findMany({
    where: {
      OR: [
        { asignadoAId: params.userId },
        { ejecutadaRealmenteId: params.userId },
      ],
      estado: "COMPLETADA",
      completadaEn: { gte: inicio, lte: fin },
      catalogoTarea: { codigo: "POST_WEB_03_REPORTE_GERENCIAL" },
    },
    include: { workflowInstancia: true },
  });

  if (reportes.length === 0) {
    return { valor: 100, snapshot: { sinData: true } };
  }

  const aTiempo = reportes.filter((t) => {
    if (!t.completadaEn || !t.workflowInstancia?.fechaHito) return false;
    return (
      differenceInHours(t.completadaEn, t.workflowInstancia.fechaHito) <= 72
    );
  });

  return {
    valor: (aTiempo.length / reportes.length) * 100,
    snapshot: { totalReportes: reportes.length, aTiempo: aTiempo.length },
  };
}

// ─── Placeholders (pendiente integración externa) ─────────────────

export async function calcularKpiPuntualidadPublicacion(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

export async function calcularKpiReportesSemanales(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

export async function calcularKpiPiezasEntregadas(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

export async function calcularKpiTiempoEntrega(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

export async function calcularKpiMetasArea(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

export async function calcularKpiDesarrolloEquipo(
  _params: CalcParams
): Promise<CalcResult> {
  return { valor: 0, snapshot: { pendienteImplementacion: true } };
}

// ─── Dispatcher ────────────────────────────────────────────────────

const FUNCIONES_CALCULO: Record<
  string,
  (p: CalcParams) => Promise<CalcResult>
> = {
  calcularKpiCalidadChecklists,
  calcularKpiAnticipacion48h,
  calcularKpiResolucionBloqueos,
  calcularKpiAyudasCruzadas,
  calcularKpiReportePostEvento,
  calcularKpiPuntualidadPublicacion,
  calcularKpiReportesSemanales,
  calcularKpiPiezasEntregadas,
  calcularKpiTiempoEntrega,
  calcularKpiMetasArea,
  calcularKpiDesarrolloEquipo,
};

export async function ejecutarCalculoAutomatico(params: {
  funcionNombre: string;
  userId: string;
  mes: number;
  anio: number;
}): Promise<CalcResult> {
  const fn = FUNCIONES_CALCULO[params.funcionNombre];
  if (!fn) throw new Error(`Función de cálculo no encontrada: ${params.funcionNombre}`);
  return fn({ userId: params.userId, mes: params.mes, anio: params.anio });
}
