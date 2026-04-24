/**
 * Prompt 18 — Auto-cálculo de KPIs del piloto desde tareas completadas.
 *
 * Provee helpers read-only que, dado un userId y período, retornan valores
 * calculados a partir de las TareaInstancia. Consumibles desde:
 *  - Dashboard del jefe (mostrar cumplimiento en vivo)
 *  - Cron de cierre semanal (si se quiere persistir el valor como
 *    KpiRegistroSemanal/MetricaDesempeno)
 *
 * NO otorgan puntos ellos mismos — los puntos ya vienen por procesarEvento
 * al completar cada tarea.
 */
import { prisma } from "@/lib/prisma";
import { rangoMes } from "@/lib/gamificacion/periodo";

/**
 * CHECKLIST_48H — % de tareas PRE_WEBINAR completadas ≥48h antes del hito.
 * Aplica a Asistente de Eventos.
 */
export async function calcularChecklist48h(params: {
  userId: string;
  mes: number;
  anio: number;
}): Promise<{ total: number; aTiempo: number; porcentaje: number }> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);
  const tareas = await prisma.tareaInstancia.findMany({
    where: {
      OR: [{ asignadoAId: params.userId }, { ejecutadaRealmenteId: params.userId }],
      completadaEn: { gte: inicio, lte: fin },
      estado: "COMPLETADA",
      catalogoTarea: { categoria: "PRE_WEBINAR" },
    },
    include: {
      workflowInstancia: { select: { fechaHito: true } },
    },
  });

  let aTiempo = 0;
  for (const t of tareas) {
    if (!t.completadaEn || !t.workflowInstancia) continue;
    const horasAntes =
      (t.workflowInstancia.fechaHito.getTime() - t.completadaEn.getTime()) /
      (60 * 60 * 1000);
    if (horasAntes >= 48) aTiempo++;
  }

  return {
    total: tareas.length,
    aTiempo,
    porcentaje: tareas.length > 0 ? (aTiempo / tareas.length) * 100 : 100,
  };
}

/**
 * REPORTE_POST_EVENTO_72H — % de reportes gerenciales POST_WEB_03 completados
 * dentro de 72h del webinar.
 */
export async function calcularReportesPost72h(params: {
  userId: string;
  mes: number;
  anio: number;
}): Promise<{ total: number; aTiempo: number; porcentaje: number }> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);
  const reportes = await prisma.tareaInstancia.findMany({
    where: {
      OR: [{ asignadoAId: params.userId }, { ejecutadaRealmenteId: params.userId }],
      completadaEn: { gte: inicio, lte: fin },
      estado: "COMPLETADA",
      catalogoTarea: { codigo: "POST_WEB_03_REPORTE_GERENCIAL" },
    },
    include: {
      workflowInstancia: { select: { fechaHito: true } },
    },
  });

  let aTiempo = 0;
  for (const r of reportes) {
    if (!r.completadaEn || !r.workflowInstancia) continue;
    const horasDespues =
      (r.completadaEn.getTime() - r.workflowInstancia.fechaHito.getTime()) /
      (60 * 60 * 1000);
    if (horasDespues <= 72) aTiempo++;
  }

  return {
    total: reportes.length,
    aTiempo,
    porcentaje: reportes.length > 0 ? (aTiempo / reportes.length) * 100 : 100,
  };
}

/**
 * EVENTOS_SIN_INCIDENCIAS — % de workflows WEBINAR activos/completados del mes
 * que no tuvieron tareas VENCIDAS ni bloqueos de >5 días.
 */
export async function calcularEventosSinIncidencias(params: {
  areaId: string;
  mes: number;
  anio: number;
}): Promise<{ total: number; limpios: number; porcentaje: number }> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);
  const workflows = await prisma.workflowInstancia.findMany({
    where: {
      fechaHito: { gte: inicio, lte: fin },
      plantilla: { categoria: "WEBINAR" },
      responsableGeneral: { areaId: params.areaId },
    },
    include: {
      tareas: {
        select: {
          estado: true,
          bloqueoExternoDesde: true,
          bloqueoExternoHasta: true,
        },
      },
    },
  });

  const SEIS_DIAS_MS = 6 * 24 * 60 * 60 * 1000;

  let limpios = 0;
  for (const w of workflows) {
    const tieneVencidas = w.tareas.some((t) => t.estado === "VENCIDA");
    const tieneBloqueoLargo = w.tareas.some((t) => {
      if (!t.bloqueoExternoDesde) return false;
      const hasta = t.bloqueoExternoHasta ?? new Date();
      return hasta.getTime() - t.bloqueoExternoDesde.getTime() > SEIS_DIAS_MS;
    });
    if (!tieneVencidas && !tieneBloqueoLargo) limpios++;
  }

  return {
    total: workflows.length,
    limpios,
    porcentaje: workflows.length > 0 ? (limpios / workflows.length) * 100 : 100,
  };
}

/**
 * REPORTES_SEMANALES — cantidad de SEO_REC_06_REPORTE_MENSUAL completadas
 * en el mes. Aplica a Trafficker.
 */
export async function calcularReportesMensualesSEO(params: {
  userId: string;
  mes: number;
  anio: number;
}): Promise<{ count: number }> {
  const { inicio, fin } = rangoMes(params.mes, params.anio);
  const count = await prisma.tareaInstancia.count({
    where: {
      OR: [{ asignadoAId: params.userId }, { ejecutadaRealmenteId: params.userId }],
      completadaEn: { gte: inicio, lte: fin },
      estado: "COMPLETADA",
      catalogoTarea: { codigo: "SEO_REC_06_REPORTE_MENSUAL" },
    },
  });
  return { count };
}
