"use client";

import { TrendingUp, TrendingDown, Minus, Target, Award } from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { clasificarDesempeno } from "@/lib/desempeno/calculos";
import { cn } from "@/lib/utils";
import type { ResumenDesempeno } from "@/lib/desempeno/queries";

export function DesempenoResumen({
  resumen,
}: {
  resumen: ResumenDesempeno;
}) {
  const clasificacion = clasificarDesempeno(resumen.porcentajeCumplimiento);

  const tendenciaConfig = {
    subiendo: { icon: TrendingUp, label: "Subiendo", color: "text-success" },
    bajando: { icon: TrendingDown, label: "Puede mejorar", color: "text-amber-500" },
    estable: { icon: Minus, label: "Estable", color: "text-muted-foreground" },
  };

  const tend = tendenciaConfig[resumen.tendencia];
  const TendIcon = tend.icon;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Cumplimiento */}
      <AnimatedCard delay={0} className="p-5">
        <div className="flex items-center gap-3">
          <ProgressRing
            value={resumen.porcentajeCumplimiento}
            size={48}
            strokeWidth={4}
            showLabel={false}
          />
          <div>
            <p className="text-xs text-muted-foreground">Cumplimiento</p>
            <p className={cn("text-xl font-bold", clasificacion.color)}>
              {resumen.porcentajeCumplimiento}%
            </p>
            <p className={cn("text-xs", clasificacion.color)}>
              {clasificacion.etiqueta}
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Objetivos */}
      <AnimatedCard delay={0.08} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Objetivos</p>
            <p className="text-xl font-bold">
              {resumen.metricasCumplidas} de {resumen.totalMetricasPeriodo}
            </p>
            <p className="text-xs text-muted-foreground">cumplidos este periodo</p>
          </div>
        </div>
      </AnimatedCard>

      {/* Tendencia */}
      <AnimatedCard delay={0.16} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2.5">
            <TendIcon className={cn("h-5 w-5", tend.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tendencia</p>
            <p className={cn("text-lg font-bold", tend.color)}>
              {tend.label}
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Reconocimientos */}
      <AnimatedCard delay={0.24} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2.5">
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Objetivos historicos</p>
            <p className="text-xl font-bold">
              {resumen.totalObjetivosCumplidos}
            </p>
            <p className="text-xs text-muted-foreground">alcanzados en total</p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
