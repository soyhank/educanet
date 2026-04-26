import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const nivelValues = ["BASICO", "INTERMEDIO", "AVANZADO"] as const;
export const ordenValues = ["recientes", "alfabetico", "duracion"] as const;
export const estadoValues = [
  "no-iniciado",
  "en-progreso",
  "completado",
] as const;
export const vistaValues = ["grid", "list"] as const;

export const filtrosCursosCache = createSearchParamsCache({
  area: parseAsString.withDefault(""),
  nivel: parseAsStringLiteral(nivelValues),
  estado: parseAsStringLiteral(estadoValues),
  busqueda: parseAsString.withDefault(""),
  orden: parseAsStringLiteral(ordenValues).withDefault("recientes"),
  vista: parseAsStringLiteral(vistaValues).withDefault("grid"),
});
