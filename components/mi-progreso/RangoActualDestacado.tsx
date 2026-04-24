"use client";

import { Medal, Trophy, Gem, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoRango } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParticulasSideral } from "./ParticulasSideral";

const RANGO_VISUAL: Record<
  TipoRango,
  {
    icono: typeof Medal;
    label: string;
    gradiente: string;
    texto: string;
    iconoColor: string;
  }
> = {
  BRONCE: {
    icono: Medal,
    label: "Bronce",
    gradiente:
      "from-[#CD7F32]/40 via-[#B8732E]/25 to-amber-900/30 dark:from-[#CD7F32]/30 dark:via-[#8B5A2B]/25 dark:to-amber-950/40",
    texto: "text-amber-900 dark:text-amber-200",
    iconoColor: "text-[#CD7F32]",
  },
  ORO: {
    icono: Trophy,
    label: "Oro",
    gradiente:
      "from-[#FFD700]/40 via-amber-400/30 to-amber-600/25 dark:from-[#FFD700]/30 dark:via-amber-500/25 dark:to-amber-800/40",
    texto: "text-amber-900 dark:text-amber-100",
    iconoColor: "text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]",
  },
  DIAMANTE: {
    icono: Gem,
    label: "Diamante",
    gradiente:
      "from-cyan-200/50 via-sky-300/40 to-indigo-400/30 dark:from-cyan-400/30 dark:via-sky-500/25 dark:to-indigo-600/40",
    texto: "text-cyan-900 dark:text-cyan-100",
    iconoColor:
      "text-[#B9F2FF] drop-shadow-[0_0_10px_rgba(185,242,255,0.6)]",
  },
  SIDERAL: {
    icono: Sparkles,
    label: "Sideral",
    gradiente:
      "from-violet-400/45 via-indigo-500/35 to-fuchsia-500/35 dark:from-violet-500/40 dark:via-indigo-600/35 dark:to-fuchsia-600/40",
    texto: "text-violet-900 dark:text-violet-100",
    iconoColor:
      "text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.7)]",
  },
};

const TABLA_RANGOS: Array<{
  rango: TipoRango;
  label: string;
  icono: string;
  rango_pts: string;
}> = [
  { rango: "BRONCE", label: "Bronce", icono: "🥉", rango_pts: "0 – 799" },
  { rango: "ORO", label: "Oro", icono: "🥇", rango_pts: "800 – 1.399" },
  { rango: "DIAMANTE", label: "Diamante", icono: "💎", rango_pts: "1.400 – 1.799" },
  { rango: "SIDERAL", label: "Sideral", icono: "✦", rango_pts: "1.800+" },
];

export function RangoActualDestacado({
  rango,
  puntos,
  siguienteRango,
  puntosParaSiguiente,
  porcentajeAlSiguiente,
  diasRestantes,
}: {
  rango: TipoRango;
  puntos: number;
  siguienteRango: TipoRango | null;
  puntosParaSiguiente: number;
  porcentajeAlSiguiente: number;
  diasRestantes: number;
}) {
  const visual = RANGO_VISUAL[rango];
  const Icono = visual.icono;
  const siguienteVisual = siguienteRango ? RANGO_VISUAL[siguienteRango] : null;
  const esSideral = rango === "SIDERAL";

  return (
    <TooltipProvider delay={150}>
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 sm:p-8",
          "bg-gradient-to-br",
          visual.gradiente
        )}
      >
        {esSideral && <ParticulasSideral />}

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Icono className={cn("h-16 w-16 sm:h-20 sm:w-20", visual.iconoColor)} />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Rango del mes
                </p>
                <Tooltip>
                  <TooltipTrigger
                    render={(props) => (
                      <button
                        {...props}
                        type="button"
                        aria-label="Ver tabla de rangos"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    )}
                  />
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="mb-1.5 text-xs font-semibold">Rangos del mes</p>
                    <div className="space-y-1 text-xs">
                      {TABLA_RANGOS.map((t) => (
                        <div
                          key={t.rango}
                          className={cn(
                            "flex items-center justify-between gap-4",
                            t.rango === rango &&
                              "font-medium text-primary"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <span>{t.icono}</span>
                            <span>{t.label}</span>
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {t.rango_pts} pts
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 border-t pt-2 text-[10px] text-muted-foreground">
                      Los puntos se reinician cada mes
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight sm:text-4xl",
                  esSideral ? "text-shimmer-2026" : visual.texto
                )}
              >
                {visual.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {puntos} puntos · {diasRestantes} dias restantes
              </p>
            </div>
          </div>

          {siguienteVisual && (
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Siguiente: {siguienteVisual.label}
                </span>
                <span className="font-medium">
                  {Math.round(porcentajeAlSiguiente)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background/50">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${porcentajeAlSiguiente}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Te faltan {puntosParaSiguiente} puntos
              </p>
            </div>
          )}
        </div>

        <p className="relative mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
          {esSideral
            ? "Estás en la cima — rango máximo del mes"
            : "Los puntos se reinician cada mes"}
        </p>
      </section>
    </TooltipProvider>
  );
}
