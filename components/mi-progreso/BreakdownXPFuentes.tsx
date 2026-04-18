import { GraduationCap, Target, CheckCircle2, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FuenteXP } from "@prisma/client";

const FUENTE_META: Record<
  FuenteXP,
  { label: string; icono: typeof Target; color: string; barra: string }
> = {
  KPIS: {
    label: "KPIs del rol",
    icono: Target,
    color: "text-primary",
    barra: "bg-primary",
  },
  APRENDIZAJE: {
    label: "Cursos y lecciones",
    icono: GraduationCap,
    color: "text-blue-500 dark:text-blue-400",
    barra: "bg-blue-500 dark:bg-blue-400",
  },
  COMPROMISOS: {
    label: "Cumplimiento de compromisos",
    icono: CheckCircle2,
    color: "text-emerald-500 dark:text-emerald-400",
    barra: "bg-emerald-500 dark:bg-emerald-400",
  },
  RECONOCIMIENTOS: {
    label: "Reconocimientos entre pares",
    icono: Heart,
    color: "text-rose-500",
    barra: "bg-rose-500",
  },
  MISIONES: {
    label: "Misiones especiales",
    icono: Zap,
    color: "text-amber-500 dark:text-amber-400",
    barra: "bg-amber-500 dark:bg-amber-400",
  },
  EQUIPO: {
    label: "Bonus de equipo",
    icono: Zap,
    color: "text-purple-500 dark:text-purple-400",
    barra: "bg-purple-500 dark:bg-purple-400",
  },
  SISTEMA: {
    label: "Sistema",
    icono: Zap,
    color: "text-muted-foreground",
    barra: "bg-muted-foreground",
  },
};

export function BreakdownXPFuentes({
  fuentes,
  total,
  multiplicadorAplicado,
}: {
  fuentes: Array<{
    fuente: FuenteXP;
    puntos: number;
    tope: number;
    porcentaje: number;
  }>;
  total: number;
  multiplicadorAplicado: boolean;
}) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Puntos por fuente</h3>
        <span className="text-xs text-muted-foreground">
          Total: <span className="font-medium text-foreground">{total} pts</span>
        </span>
      </div>

      {multiplicadorAplicado && (
        <div className="mb-4 rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Multiplicador activo</p>
          <p className="mt-0.5">
            Tu cumplimiento de KPIs esta bajo el 70%. Los puntos de las demas
            fuentes se otorgan al 50% hasta que lo recuperes.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {fuentes.map((f) => {
          const meta = FUENTE_META[f.fuente];
          const Icono = meta.icono;
          const capado =
            f.fuente !== "KPIS" && multiplicadorAplicado ? 50 : 100;
          return (
            <div key={f.fuente}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icono className={cn("h-4 w-4", meta.color)} />
                  <span className="font-medium">{meta.label}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {f.puntos}
                  </span>{" "}
                  / {f.tope}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    meta.barra
                  )}
                  style={{ width: `${f.porcentaje}%` }}
                />
                {capado < 100 && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 border-l-2 border-dashed border-amber-500/70"
                    style={{ left: `${capado}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
