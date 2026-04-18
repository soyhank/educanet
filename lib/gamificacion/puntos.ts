import type {
  RazonPuntos,
  TipoEventoGamificacion,
  FuenteXP,
} from "@prisma/client";
import { procesarEvento } from "./motor";

/**
 * Curva de nivel legacy. Se mantiene por compatibilidad con vistas
 * (TabHistorialPuntos, LogrosHeader) que aun la usan visualmente
 * como "nivel global historico". Los rangos mensuales viven en
 * lib/gamificacion/rangos.ts.
 */
export function puntosParaNivel(nivel: number): number {
  return Math.round(100 * Math.pow(nivel, 1.5));
}

export function calcularNivel(puntos: number): number {
  let nivel = 1;
  while (puntosParaNivel(nivel + 1) <= puntos) {
    nivel++;
  }
  return nivel;
}

export function puntosParaSiguienteNivel(
  nivelActual: number,
  puntosActuales: number
): { puntosNecesarios: number; puntosFaltantes: number; progreso: number } {
  const puntosNecesarios = puntosParaNivel(nivelActual + 1);
  const puntosNivelActual = puntosParaNivel(nivelActual);
  const rango = puntosNecesarios - puntosNivelActual;
  const progreso = Math.min(
    100,
    Math.max(0, ((puntosActuales - puntosNivelActual) / rango) * 100)
  );
  const puntosFaltantes = Math.max(0, puntosNecesarios - puntosActuales);
  return { puntosNecesarios, puntosFaltantes, progreso };
}

const MAPA_RAZON_EVENTO: Record<
  RazonPuntos,
  { tipo: TipoEventoGamificacion; fuente: FuenteXP }
> = {
  COMPLETAR_LECCION: { tipo: "LECCION_COMPLETADA", fuente: "APRENDIZAJE" },
  APROBAR_QUIZ: { tipo: "QUIZ_APROBADO", fuente: "APRENDIZAJE" },
  COMPLETAR_CURSO: { tipo: "CURSO_COMPLETADO", fuente: "APRENDIZAJE" },
  RACHA_DIAS: { tipo: "RACHA_INCREMENTADA", fuente: "SISTEMA" },
  COMPLETAR_RUTA: { tipo: "CURSO_COMPLETADO", fuente: "APRENDIZAJE" },
  AJUSTE_ADMIN: { tipo: "AJUSTE_ADMIN", fuente: "SISTEMA" },
  LOGRO_OBJETIVO: { tipo: "BADGE_OBTENIDO", fuente: "SISTEMA" },
  SUBIDA_NIVEL: { tipo: "SUBIDA_NIVEL", fuente: "SISTEMA" },
  LIKE_RECIBIDO: { tipo: "LIKE_RECIBIDO", fuente: "SISTEMA" },
};

/**
 * Wrapper legacy. Todo nuevo codigo deberia llamar a
 * procesarEvento directamente desde motor.ts, pero esta
 * funcion sigue funcionando y delega al motor para asegurar
 * que los topes, multiplicador y rango mensual se apliquen.
 */
export async function otorgarPuntos(params: {
  userId: string;
  cantidad: number;
  razon: RazonPuntos;
  descripcion?: string;
  referenciaId?: string;
}): Promise<{
  nuevoTotal: number;
  subioDeNivel: boolean;
  nuevoNivel?: number;
}> {
  const mapeo = MAPA_RAZON_EVENTO[params.razon];
  const resultado = await procesarEvento({
    userId: params.userId,
    tipo: mapeo.tipo,
    fuente: mapeo.fuente,
    puntosBrutos: params.cantidad,
    descripcion: params.descripcion,
    referenciaId: params.referenciaId,
  });

  return {
    nuevoTotal: resultado.nuevoTotalMes,
    subioDeNivel: resultado.subioDeRango,
    nuevoNivel: undefined,
  };
}
