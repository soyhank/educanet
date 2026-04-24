import { prisma } from "@/lib/prisma";
import type { FuenteXP } from "@prisma/client";

export const UMBRAL_MULTIPLICADOR = 0.7; // 70%
export const FACTOR_REDUCCION = 0.5; // 50%

export const TOPES_MENSUALES: Record<FuenteXP, number> = {
  APRENDIZAJE: 400,
  KPIS: 1000,
  TAREAS_OPERATIVAS: 400,
  COMPROMISOS: 100,
  RECONOCIMIENTOS: 200,
  MISIONES: 200,
  EQUIPO: 300,
  SISTEMA: Number.POSITIVE_INFINITY,
};

type ResultadoAjuste = {
  puntosFinales: number;
  fueModificado: boolean;
  razon?: string;
};

async function totalFuenteMes(
  userId: string,
  fuente: FuenteXP,
  mes: number,
  anio: number
): Promise<number> {
  const r = await prisma.eventoGamificacion.aggregate({
    where: { userId, fuente, mesPeriodo: mes, anioPeriodo: anio },
    _sum: { cantidad: true },
  });
  return r._sum.cantidad ?? 0;
}

/**
 * Aplica topes mensuales por fuente y, si corresponde,
 * el multiplicador por bajo cumplimiento de KPIs.
 */
export async function ajustarPuntos(params: {
  userId: string;
  fuente: FuenteXP;
  puntosBrutos: number;
  mes: number;
  anio: number;
}): Promise<ResultadoAjuste> {
  // 1. Tope mensual por fuente
  const tope = TOPES_MENSUALES[params.fuente];
  let puntosFinales = params.puntosBrutos;
  let modificado = false;
  const razones: string[] = [];

  if (tope !== Number.POSITIVE_INFINITY) {
    const yaGanado = await totalFuenteMes(
      params.userId,
      params.fuente,
      params.mes,
      params.anio
    );
    const restante = tope - yaGanado;
    if (restante <= 0) {
      return {
        puntosFinales: 0,
        fueModificado: true,
        razon: `Tope mensual de ${params.fuente} alcanzado (${tope} pts).`,
      };
    }
    if (puntosFinales > restante) {
      razones.push(
        `Capado al tope mensual de ${params.fuente} (${tope} pts).`
      );
      puntosFinales = restante;
      modificado = true;
    }
  }

  // 2. Multiplicador KPIs: no aplica a KPIS ni SISTEMA
  if (params.fuente !== "KPIS" && params.fuente !== "SISTEMA") {
    const { calcularCumplimientoKpis } = await import(
      "@/lib/kpis/calculo"
    );
    const cumplimiento = await calcularCumplimientoKpis({
      userId: params.userId,
      mes: params.mes,
      anio: params.anio,
    });
    if (
      cumplimiento.hayDatosSuficientes &&
      cumplimiento.porcentaje < UMBRAL_MULTIPLICADOR * 100
    ) {
      puntosFinales = Math.floor(puntosFinales * FACTOR_REDUCCION);
      razones.push(
        `Cumplimiento de KPIs (${cumplimiento.porcentaje.toFixed(0)}%) bajo el 70%. Puntos reducidos al 50%.`
      );
      modificado = true;
    }
  }

  return {
    puntosFinales,
    fueModificado: modificado,
    razon: razones.length > 0 ? razones.join(" ") : undefined,
  };
}
