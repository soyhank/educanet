"use client";

import {
  GraduationCap,
  Target,
  CheckCircle2,
  Heart,
  Zap,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FuenteXP } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MetaFuente = {
  label: string;
  icono: typeof Target;
  color: string;
  barra: string;
  tooltip: string;
  destacada?: boolean;
};

const FUENTE_META: Record<FuenteXP, MetaFuente> = {
  KPIS: {
    label: "KPIs del rol",
    icono: Target,
    color: "text-primary",
    barra: "bg-primary",
    tooltip:
      "Métricas principales de tu puesto. Los valores pueden ser auto-calculados, reportados por ti (con validación del jefe) o evaluados directamente por tu jefe.",
  },
  APRENDIZAJE: {
    label: "Cursos y lecciones",
    icono: GraduationCap,
    color: "text-blue-500 dark:text-blue-400",
    barra: "bg-blue-500 dark:bg-blue-400",
    tooltip:
      "Contenido formativo que completas según tu ruta de carrera.",
  },
  TAREAS_OPERATIVAS: {
    label: "Tareas operativas",
    icono: ListChecks,
    color: "text-emerald-600 dark:text-emerald-400",
    barra: "bg-emerald-600 dark:bg-emerald-400",
    tooltip:
      "Trabajo estructurado del workflow asignado a tu rol. El sistema asigna tareas cuando se programan webinars, campañas y otros procesos.",
    destacada: true,
  },
  COMPROMISOS: {
    label: "Compromisos propios",
    icono: Sparkles,
    color: "text-teal-500 dark:text-teal-400",
    barra: "bg-teal-500 dark:bg-teal-400",
    tooltip:
      "Iniciativas que tú mismo propones al margen del workflow. Tu jefe los valida. Menos puntos pero más valor: demuestra que vas más allá de tu rol.",
  },
  RECONOCIMIENTOS: {
    label: "Reconocimientos entre pares",
    icono: Heart,
    color: "text-rose-500",
    barra: "bg-rose-500",
    tooltip:
      "Puntos que tus compañeros te otorgan al reconocer tu aporte.",
  },
  MISIONES: {
    label: "Misiones semanales",
    icono: Zap,
    color: "text-amber-500 dark:text-amber-400",
    barra: "bg-amber-500 dark:bg-amber-400",
    tooltip:
      "3 desafíos personalizados que recibes cada lunes.",
  },
  EQUIPO: {
    label: "Bonus de equipo",
    icono: CheckCircle2,
    color: "text-purple-500 dark:text-purple-400",
    barra: "bg-purple-500 dark:bg-purple-400",
    tooltip:
      "Bonificación cuando el equipo alcanza la meta mensual de KPIs.",
  },
  SISTEMA: {
    label: "Sistema",
    icono: Zap,
    color: "text-muted-foreground",
    barra: "bg-muted-foreground",
    tooltip: "Ajustes administrativos u otros movimientos puntuales.",
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
    <TooltipProvider delay={150}>
      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Puntos por fuente</h3>
          <span className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground tabular-nums">{total} pts</span>
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
            const alcanzoTope = f.puntos >= f.tope && Number.isFinite(f.tope);
            return (
              <Tooltip key={f.fuente}>
                <TooltipTrigger
                  render={(props) => (
                    <div {...props} className="cursor-help text-left w-full">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icono className={cn("h-4 w-4", meta.color)} />
                          <span
                            className={cn(
                              "font-medium",
                              meta.destacada && "tracking-tight"
                            )}
                          >
                            {meta.label}
                          </span>
                          {meta.destacada && (
                            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                              Rol
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          <span
                            className={cn(
                              "font-medium",
                              alcanzoTope ? "text-primary" : "text-foreground"
                            )}
                          >
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
                  )}
                />
                <TooltipContent side="right" className="max-w-[280px]">
                  <p className="text-xs">{meta.tooltip}</p>
                  {alcanzoTope && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Tope mensual alcanzado. Seguí sumando en otras fuentes.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}
