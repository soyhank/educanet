import type { TipoRango } from "@prisma/client";

export const COLORES_RANGO = {
  BRONCE: {
    base: "hsl(25 75% 55%)",
    glow: "hsl(25 90% 65% / 0.3)",
    gradient:
      "linear-gradient(135deg, hsl(25 75% 55%), hsl(30 65% 45%))",
    icono: "🥉",
    nombre: "Bronce",
    descripcion: "Estás arrancando tu mes",
  },
  ORO: {
    base: "hsl(42 95% 60%)",
    glow: "hsl(42 95% 65% / 0.35)",
    gradient:
      "linear-gradient(135deg, hsl(42 95% 60%), hsl(38 85% 50%))",
    icono: "🥇",
    nombre: "Oro",
    descripcion: "Rendimiento sólido",
  },
  DIAMANTE: {
    base: "hsl(195 90% 75%)",
    glow: "hsl(195 95% 75% / 0.4)",
    gradient:
      "linear-gradient(135deg, hsl(195 90% 75%), hsl(210 85% 65%))",
    icono: "💎",
    nombre: "Diamante",
    descripcion: "Excelencia sostenida",
  },
  SIDERAL: {
    base: "hsl(262 85% 70%)",
    glow: "hsl(262 95% 75% / 0.5)",
    gradient:
      "linear-gradient(135deg, hsl(262 85% 70%), hsl(220 75% 55%), hsl(280 80% 65%))",
    icono: "✦",
    nombre: "Sideral",
    descripcion: "Estás en la cima",
  },
} as const satisfies Record<TipoRango, unknown>;

export type RangoKey = keyof typeof COLORES_RANGO;
