import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CumplimientoKpi } from "@/lib/kpis/calculo";

function semaforo(cumplimiento: number, tieneRegistros: boolean) {
  if (!tieneRegistros) return { icon: MinusCircle, color: "text-muted-foreground", label: "Sin datos" };
  if (cumplimiento >= 95) return { icon: CheckCircle2, color: "text-primary", label: "En camino" };
  if (cumplimiento >= 70) return { icon: ArrowUpRight, color: "text-blue-500 dark:text-blue-400", label: "Acerca" };
  return { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", label: "Atencion" };
}

export function CumplimientoKPIsResumen({
  cumplimientos,
  cumplimientoGlobal,
  hayDatosSuficientes,
}: {
  cumplimientos: CumplimientoKpi[];
  cumplimientoGlobal: number;
  hayDatosSuficientes: boolean;
}) {
  if (cumplimientos.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-base font-semibold">KPIs del mes</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Aun no tienes KPIs asignados este mes. Tu jefe o RRHH los asignara
          al iniciar el periodo.
        </p>
      </section>
    );
  }

  const bajoUmbral = hayDatosSuficientes && cumplimientoGlobal < 70;

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">KPIs del mes</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cumplimiento ponderado:{" "}
            <span
              className={cn(
                "font-semibold tabular-nums",
                bajoUmbral
                  ? "text-amber-600 dark:text-amber-400"
                  : cumplimientoGlobal >= 95
                    ? "text-primary"
                    : "text-foreground"
              )}
            >
              {cumplimientoGlobal.toFixed(0)}%
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/mi-progreso/kpis" />}>
          Reportar valores
        </Button>
      </div>

      {bajoUmbral && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <p>
            Cumplimiento bajo el 70%: los puntos de otras fuentes se reducen
            al 50% hasta que lo recuperes.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {cumplimientos.map((c) => {
          const s = semaforo(c.cumplimiento, c.tieneRegistros);
          const Icon = s.icon;
          return (
            <div
              key={c.definicionId}
              className="flex items-center gap-3 rounded-lg border bg-background/50 p-3"
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", s.color)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Peso {c.peso}% · {c.valorActual.toFixed(1)} {c.unidad} de{" "}
                  {c.valorObjetivo} {c.unidad}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 text-sm font-semibold tabular-nums",
                  s.color
                )}
              >
                {c.tieneRegistros ? `${Math.round(c.cumplimiento)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
