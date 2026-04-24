import { Medal, Trophy, Gem, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoRango } from "@prisma/client";

const RANGO_COLOR: Record<
  TipoRango,
  { icono: typeof Medal; bg: string; text: string; label: string }
> = {
  BRONCE: {
    icono: Medal,
    bg: "bg-amber-700/20",
    text: "text-amber-900 dark:text-amber-200",
    label: "Bronce",
  },
  ORO: {
    icono: Trophy,
    bg: "bg-amber-400/30",
    text: "text-amber-900 dark:text-amber-100",
    label: "Oro",
  },
  DIAMANTE: {
    icono: Gem,
    bg: "bg-cyan-400/30",
    text: "text-cyan-900 dark:text-cyan-100",
    label: "Diamante",
  },
  SIDERAL: {
    icono: Sparkles,
    bg: "bg-violet-500/25",
    text: "text-violet-900 dark:text-violet-100",
    label: "Sideral",
  },
};

export function DistribucionRangos({
  distribucion,
  total,
}: {
  distribucion: Record<TipoRango, number>;
  total: number;
}) {
  const orden: TipoRango[] = ["BRONCE", "ORO", "DIAMANTE", "SIDERAL"];

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-base font-semibold">Distribucion de rangos</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {orden.map((r) => {
          const visual = RANGO_COLOR[r];
          const cuenta = distribucion[r];
          const pct = total > 0 ? Math.round((cuenta / total) * 100) : 0;
          const Icon = visual.icono;
          return (
            <div
              key={r}
              className={cn("rounded-lg p-4", visual.bg)}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-5 w-5", visual.text)} />
                <span className={cn("text-sm font-medium", visual.text)}>
                  {visual.label}
                </span>
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", visual.text)}>
                {cuenta}
              </p>
              <p className={cn("text-xs", visual.text)}>
                {pct}% del equipo
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
