import { prisma } from "@/lib/prisma";
import type { TipoRango, FuenteXP } from "@prisma/client";

export const UMBRALES_RANGO = {
  BRONCE: { min: 0, max: 800 },
  ORO: { min: 800, max: 1400 },
  DIAMANTE: { min: 1400, max: 1800 },
  SIDERAL: { min: 1800, max: Infinity },
} as const;

export function rangoSegunPuntos(puntos: number): TipoRango {
  if (puntos >= 1800) return "SIDERAL";
  if (puntos >= 1400) return "DIAMANTE";
  if (puntos >= 800) return "ORO";
  return "BRONCE";
}

const RANGO_ORDEN: Record<TipoRango, number> = {
  BRONCE: 0,
  ORO: 1,
  DIAMANTE: 2,
  SIDERAL: 3,
};

export function rangoOrden(r: TipoRango): number {
  return RANGO_ORDEN[r];
}

export function siguienteRango(r: TipoRango): TipoRango | null {
  if (r === "BRONCE") return "ORO";
  if (r === "ORO") return "DIAMANTE";
  if (r === "DIAMANTE") return "SIDERAL";
  return null;
}

export function proyeccionRango(puntos: number): {
  rangoActual: TipoRango;
  siguiente: TipoRango | null;
  puntosParaSiguiente: number;
  porcentajeAlSiguiente: number;
} {
  const rangoActual = rangoSegunPuntos(puntos);
  const siguiente = siguienteRango(rangoActual);
  if (!siguiente) {
    return {
      rangoActual,
      siguiente: null,
      puntosParaSiguiente: 0,
      porcentajeAlSiguiente: 100,
    };
  }
  const umbralSiguiente = UMBRALES_RANGO[siguiente].min;
  const umbralActual = UMBRALES_RANGO[rangoActual].min;
  const rango = umbralSiguiente - umbralActual;
  const progreso = puntos - umbralActual;
  const porcentaje = Math.min(
    100,
    Math.max(0, (progreso / rango) * 100)
  );
  return {
    rangoActual,
    siguiente,
    puntosParaSiguiente: Math.max(0, umbralSiguiente - puntos),
    porcentajeAlSiguiente: porcentaje,
  };
}

type PuntosPorFuente = Record<FuenteXP, number>;

function puntosPorFuenteVacio(): PuntosPorFuente {
  return {
    APRENDIZAJE: 0,
    KPIS: 0,
    TAREAS_OPERATIVAS: 0,
    COMPROMISOS: 0,
    RECONOCIMIENTOS: 0,
    MISIONES: 0,
    EQUIPO: 0,
    SISTEMA: 0,
  };
}

export async function sumarPuntosPorFuenteMes(
  userId: string,
  mes: number,
  anio: number
): Promise<PuntosPorFuente> {
  const eventos = await prisma.eventoGamificacion.groupBy({
    by: ["fuente"],
    where: { userId, mesPeriodo: mes, anioPeriodo: anio },
    _sum: { cantidad: true },
  });

  const res = puntosPorFuenteVacio();
  for (const e of eventos) {
    res[e.fuente] = e._sum.cantidad ?? 0;
  }
  return res;
}

export async function recalcularRangoMensual(
  userId: string,
  mes: number,
  anio: number
): Promise<{
  puntosTotales: number;
  rango: TipoRango;
  subioDeRango: boolean;
  nuevoRango?: TipoRango;
  puntosPorFuente: PuntosPorFuente;
}> {
  const { calcularCumplimientoKpis } = await import("@/lib/kpis/calculo");

  const puntosPorFuente = await sumarPuntosPorFuenteMes(userId, mes, anio);
  const puntosTotales = Object.values(puntosPorFuente).reduce(
    (a, b) => a + b,
    0
  );

  const rangoExistente = await prisma.rangoMensual.findUnique({
    where: {
      userId_periodoMes_periodoAnio: {
        userId,
        periodoMes: mes,
        periodoAnio: anio,
      },
    },
  });

  const rangoPrevio = rangoExistente?.rango ?? null;
  const rangoNuevo = rangoSegunPuntos(puntosTotales);

  const cumplimiento = await calcularCumplimientoKpis({ userId, mes, anio });

  const multiplicadorAplicado =
    cumplimiento.hayDatosSuficientes && cumplimiento.porcentaje < 70;

  await prisma.rangoMensual.upsert({
    where: {
      userId_periodoMes_periodoAnio: {
        userId,
        periodoMes: mes,
        periodoAnio: anio,
      },
    },
    create: {
      userId,
      periodoMes: mes,
      periodoAnio: anio,
      puntosTotales,
      puntosKpis: puntosPorFuente.KPIS,
      puntosCursos: puntosPorFuente.APRENDIZAJE,
      puntosTareasOperativas: puntosPorFuente.TAREAS_OPERATIVAS,
      puntosCompromisos: puntosPorFuente.COMPROMISOS,
      puntosReconocimientos: puntosPorFuente.RECONOCIMIENTOS,
      puntosMisiones: puntosPorFuente.MISIONES,
      cumplimientoKpis: cumplimiento.porcentaje,
      multiplicadorAplicado,
      rango: rangoNuevo,
    },
    update: {
      puntosTotales,
      puntosKpis: puntosPorFuente.KPIS,
      puntosCursos: puntosPorFuente.APRENDIZAJE,
      puntosTareasOperativas: puntosPorFuente.TAREAS_OPERATIVAS,
      puntosCompromisos: puntosPorFuente.COMPROMISOS,
      puntosReconocimientos: puntosPorFuente.RECONOCIMIENTOS,
      puntosMisiones: puntosPorFuente.MISIONES,
      cumplimientoKpis: cumplimiento.porcentaje,
      multiplicadorAplicado,
      rango: rangoNuevo,
    },
  });

  const subio =
    rangoPrevio !== null &&
    rangoOrden(rangoNuevo) > rangoOrden(rangoPrevio);

  return {
    puntosTotales,
    rango: rangoNuevo,
    subioDeRango: subio,
    nuevoRango: subio ? rangoNuevo : undefined,
    puntosPorFuente,
  };
}
