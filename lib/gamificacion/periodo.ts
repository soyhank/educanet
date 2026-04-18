import {
  getISOWeek,
  startOfMonth,
  endOfMonth,
  getMonth,
  getYear,
  differenceInCalendarDays,
} from "date-fns";

export function getMes(fecha: Date): number {
  return getMonth(fecha) + 1;
}

export function getAnio(fecha: Date): number {
  return getYear(fecha);
}

export function getSemanaISO(fecha: Date): { semana: number; anio: number } {
  return { semana: getISOWeek(fecha), anio: getYear(fecha) };
}

export function rangoMes(
  mes: number,
  anio: number
): { inicio: Date; fin: Date } {
  const ref = new Date(anio, mes - 1, 1);
  return { inicio: startOfMonth(ref), fin: endOfMonth(ref) };
}

export function mesActual(): { mes: number; anio: number } {
  const hoy = new Date();
  return { mes: getMes(hoy), anio: getAnio(hoy) };
}

export function diasRestantesDelMes(fecha: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(endOfMonth(fecha), fecha));
}

export function semanaDelMes(fecha: Date = new Date()): number {
  const inicio = startOfMonth(fecha);
  const dia = differenceInCalendarDays(fecha, inicio);
  return Math.floor(dia / 7) + 1;
}
