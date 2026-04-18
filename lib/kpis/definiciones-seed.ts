import type { TipoMetaKpi } from "@prisma/client";

export type DefinicionKpiSeed = {
  codigo: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  peso: number;
  tipoMeta: TipoMetaKpi;
  valorObjetivoDefault?: number;
  bonusPorcentaje?: number;
};

export const KPIS_POR_PUESTO: Record<string, DefinicionKpiSeed[]> = {
  CONTENT_MANAGER: [
    {
      codigo: "CUMPLIMIENTO_PLAN_EDITORIAL",
      nombre: "Cumplimiento del plan editorial",
      descripcion:
        "Piezas publicadas vs planificadas segun el calendario editorial del mes.",
      unidad: "%",
      peso: 30,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 100,
      bonusPorcentaje: 10,
    },
    {
      codigo: "ENGAGEMENT_PROMEDIO",
      nombre: "Engagement promedio por pieza",
      descripcion:
        "Comparado con tu baseline personal de los 3 meses anteriores.",
      unidad: "%",
      peso: 25,
      tipoMeta: "RELATIVA_BASELINE",
      bonusPorcentaje: 15,
    },
    {
      codigo: "PUNTUALIDAD_PUBLICACION",
      nombre: "Puntualidad de publicacion",
      descripcion:
        "Porcentaje de publicaciones en fecha y hora planificadas.",
      unidad: "%",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 95,
    },
    {
      codigo: "CRECIMIENTO_AUDIENCIA",
      nombre: "Crecimiento neto de audiencia",
      descripcion:
        "Nuevos seguidores netos del mes vs baseline personal.",
      unidad: "seguidores",
      peso: 15,
      tipoMeta: "RELATIVA_BASELINE",
      bonusPorcentaje: 20,
    },
    {
      codigo: "CALIDAD_PIEZAS",
      nombre: "Cero errores ortograficos y de marca",
      descripcion:
        "Cumplimiento del manual de marca y revision ortografica.",
      unidad: "%",
      peso: 10,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 100,
    },
  ],

  TRAFFICKER: [
    {
      codigo: "ROAS_CAMPANAS",
      nombre: "ROAS vs baseline personal",
      descripcion:
        "Tu ROAS del mes comparado con tu promedio historico.",
      unidad: "ratio",
      peso: 30,
      tipoMeta: "RELATIVA_BASELINE",
      bonusPorcentaje: 20,
    },
    {
      codigo: "CPL_VS_META",
      nombre: "CPL vs meta",
      descripcion: "Costo por lead comparado con la meta acordada.",
      unidad: "S/",
      peso: 25,
      tipoMeta: "ABSOLUTA",
    },
    {
      codigo: "CTR_PROMEDIO",
      nombre: "CTR promedio de anuncios",
      descripcion: "Click-through rate vs baseline de industria.",
      unidad: "%",
      peso: 20,
      tipoMeta: "RELATIVA_BASELINE",
    },
    {
      codigo: "KEYWORDS_TOP10",
      nombre: "Keywords objetivo en top 10",
      descripcion: "Palabras clave posicionadas en top 10 de Google.",
      unidad: "keywords",
      peso: 15,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 5,
    },
    {
      codigo: "REPORTES_SEMANALES",
      nombre: "Reportes semanales a tiempo",
      descripcion: "Reportes entregados dentro del plazo del mes.",
      unidad: "reportes",
      peso: 10,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 4,
    },
  ],

  DISENADOR_GRAFICO: [
    {
      codigo: "PIEZAS_ENTREGADAS",
      nombre: "Piezas entregadas vs solicitadas",
      descripcion: "Porcentaje de solicitudes atendidas en el mes.",
      unidad: "%",
      peso: 25,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 95,
    },
    {
      codigo: "TIEMPO_ENTREGA",
      nombre: "Tiempo promedio de entrega",
      descripcion:
        "Dias promedio vs meta acordada por complejidad de pieza.",
      unidad: "dias",
      peso: 20,
      tipoMeta: "ABSOLUTA",
    },
    {
      codigo: "APROBACION_PRIMERA",
      nombre: "Piezas aprobadas en primera ronda",
      descripcion: "Porcentaje de piezas aprobadas sin requerir cambios.",
      unidad: "%",
      peso: 25,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 70,
    },
    {
      codigo: "MANUAL_MARCA",
      nombre: "Cumplimiento del manual de marca",
      descripcion: "Audit mensual de adherencia a identidad visual.",
      unidad: "%",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 95,
    },
    {
      codigo: "APOYO_EXTRA",
      nombre: "Apoyo extra a otros roles",
      descripcion:
        "Apoyos entregados mas alla de solicitudes formales (validado por pares).",
      unidad: "apoyos",
      peso: 10,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 3,
      bonusPorcentaje: 15,
    },
  ],

  JEFE_MARKETING: [
    {
      codigo: "METAS_AREA",
      nombre: "Cumplimiento global de metas del area",
      descripcion: "Promedio ponderado de metas del equipo.",
      unidad: "%",
      peso: 35,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 90,
    },
    {
      codigo: "ONE_ON_ONES",
      nombre: "1:1s realizados con cada reporte",
      descripcion: "1:1 mensual minimo con cada reporte directo.",
      unidad: "sesiones",
      peso: 15,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 4,
    },
    {
      codigo: "REPORTE_GERENCIAL",
      nombre: "Reporte gerencial a tiempo",
      descripcion: "Reporte mensual entregado en fecha.",
      unidad: "reportes",
      peso: 15,
      tipoMeta: "BINARIA",
      valorObjetivoDefault: 1,
    },
    {
      codigo: "ACCIONES_CLIMA",
      nombre: "Acciones de clima de equipo",
      descripcion:
        "Retros, 1:1s y eventos ejecutados (no resultado de encuesta).",
      unidad: "acciones",
      peso: 15,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 3,
    },
    {
      codigo: "DESARROLLO_EQUIPO",
      nombre: "Desarrollo del equipo",
      descripcion: "Porcentaje de cursos completados por tus reportes directos.",
      unidad: "%",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 75,
      bonusPorcentaje: 20,
    },
  ],

  ASISTENTE_EVENTOS: [
    {
      codigo: "EVENTOS_SIN_INCIDENCIAS",
      nombre: "Eventos sin incidencias criticas",
      descripcion:
        "Porcentaje de eventos completados sin problemas mayores.",
      unidad: "%",
      peso: 30,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 95,
    },
    {
      codigo: "CHECKLIST_48H",
      nombre: "Checklist pre-evento 48h antes",
      descripcion: "Porcentaje de checklists completos al menos 48h antes.",
      unidad: "%",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 100,
    },
    {
      codigo: "PRESUPUESTO",
      nombre: "Proveedores dentro de presupuesto",
      descripcion: "Porcentaje de eventos dentro del presupuesto asignado.",
      unidad: "%",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 95,
    },
    {
      codigo: "SATISFACCION",
      nombre: "Satisfaccion post-evento",
      descripcion: "Score promedio de encuestas post-evento (1-5).",
      unidad: "score",
      peso: 20,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 4.3,
    },
    {
      codigo: "REPORTE_POST_EVENTO",
      nombre: "Reporte post-evento en 72h",
      descripcion: "Porcentaje de reportes entregados dentro de 72h.",
      unidad: "%",
      peso: 10,
      tipoMeta: "ABSOLUTA",
      valorObjetivoDefault: 100,
    },
  ],
};
