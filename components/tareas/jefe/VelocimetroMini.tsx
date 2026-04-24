"use client";

import { motion } from "framer-motion";

import type { TipoRango } from "@prisma/client";

type Props = {
  puntos: number;
  tope: number;
  rango?: TipoRango | null;
};

const LABEL_RANGO: Record<TipoRango, string> = {
  BRONCE: "Bronce",
  ORO: "Oro",
  DIAMANTE: "Diamante",
  SIDERAL: "Sideral",
};

function colorPorPorcentaje(pct: number): string {
  if (pct < 0.3) return "hsl(var(--destructive))";
  if (pct < 0.7) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

/**
 * Velocímetro compacto para las cards por miembro en el dashboard del jefe.
 * Versión reducida del VelocimetroPuntos principal.
 */
export function VelocimetroMini({ puntos, tope, rango }: Props) {
  const pct = Math.max(0, Math.min(1, puntos / tope));
  const startAngle = 135;
  const endAngle = 405;
  const sweepTotal = endAngle - startAngle;
  const sweepActual = sweepTotal * pct;

  const radio = 50;
  const cx = 70;
  const cy = 70;
  const grosor = 10;

  const arc = (anguloFin: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (anguloFin * Math.PI) / 180;
    const x1 = cx + radio * Math.cos(startRad);
    const y1 = cy + radio * Math.sin(startRad);
    const x2 = cx + radio * Math.cos(endRad);
    const y2 = cy + radio * Math.sin(endRad);
    const largeArc = anguloFin - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const fill = colorPorPorcentaje(pct);

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative">
        <svg
          width={140}
          height={110}
          viewBox="0 0 140 110"
          className="overflow-visible"
        >
          <path
            d={arc(endAngle)}
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth={grosor}
            fill="none"
            strokeLinecap="round"
          />
          {pct > 0 && (
            <motion.path
              d={arc(startAngle + sweepActual)}
              stroke={fill}
              strokeWidth={grosor}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-2xl font-semibold tabular-nums leading-none">
            {puntos}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            /{tope}
          </span>
        </div>
      </div>
      {rango && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Rango
          </span>
          <span className="text-sm font-medium">{LABEL_RANGO[rango]}</span>
        </div>
      )}
    </div>
  );
}
