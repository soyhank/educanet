"use client";

import { Sparkles, CheckCircle2 } from "lucide-react";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { PuntosDisplay } from "@/components/shared/PuntosDisplay";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { RachaIndicator } from "@/components/shared/RachaIndicator";
import { puntosParaSiguienteNivel } from "@/lib/gamificacion/puntos";

export function StatsRapidas({
  puntosTotales,
  nivel,
  cursosCompletados,
  cursosTotales,
  rachaActual,
}: {
  puntosTotales: number;
  nivel: number;
  cursosCompletados: number;
  cursosTotales: number;
  rachaActual: number;
}) {
  const { progreso, puntosFaltantes } = puntosParaSiguienteNivel(
    nivel,
    puntosTotales
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Puntos */}
      <AnimatedCard delay={0} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Puntos totales</p>
            <PuntosDisplay puntos={puntosTotales} size="lg" />
          </div>
        </div>
      </AnimatedCard>

      {/* Nivel */}
      <AnimatedCard delay={0.08} className="p-5">
        <div className="flex items-center gap-3">
          <ProgressRing value={progreso} size={48} strokeWidth={4} showLabel={false} />
          <div>
            <p className="text-xs text-muted-foreground">Nivel actual</p>
            <p className="text-xl font-bold">{nivel}</p>
            <p className="text-xs text-muted-foreground">
              {puntosFaltantes} pts para nivel {nivel + 1}
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Cursos */}
      <AnimatedCard delay={0.16} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2.5">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cursos completados</p>
            <p className="text-xl font-bold">{cursosCompletados}</p>
            <p className="text-xs text-muted-foreground">
              de {cursosTotales} disponibles
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Racha */}
      <AnimatedCard delay={0.24} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2.5">
            <RachaIndicator dias={rachaActual} size="lg" showLabel={false} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Racha</p>
            <p className="text-xl font-bold">
              {rachaActual} {rachaActual === 1 ? "dia" : "dias"}
            </p>
            {rachaActual === 0 && (
              <p className="text-xs text-muted-foreground">
                Empieza tu racha hoy
              </p>
            )}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
