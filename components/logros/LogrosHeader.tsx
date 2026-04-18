"use client";

import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { PuntosDisplay } from "@/components/shared/PuntosDisplay";
import { RachaIndicator } from "@/components/shared/RachaIndicator";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Trophy } from "lucide-react";

export function LogrosHeader({
  puntosTotales,
  badgesObtenidos,
  totalBadges,
  rachaActual,
  nivel,
  progresoNivel,
}: {
  puntosTotales: number;
  badgesObtenidos: number;
  totalBadges: number;
  rachaActual: number;
  nivel: number;
  progresoNivel: number;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Mis logros</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnimatedCard delay={0} className="p-4">
          <p className="text-xs text-muted-foreground">Puntos totales</p>
          <PuntosDisplay puntos={puntosTotales} size="lg" />
        </AnimatedCard>
        <AnimatedCard delay={0.08} className="p-4">
          <p className="text-xs text-muted-foreground">Badges</p>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold">{badgesObtenidos}</span>
            <span className="text-sm text-muted-foreground">de {totalBadges}</span>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.16} className="p-4">
          <p className="text-xs text-muted-foreground">Racha</p>
          <RachaIndicator dias={rachaActual} size="lg" />
        </AnimatedCard>
        <AnimatedCard delay={0.24} className="p-4">
          <p className="text-xs text-muted-foreground">Nivel {nivel}</p>
          <ProgressRing value={progresoNivel} size={44} strokeWidth={4} />
        </AnimatedCard>
      </div>
    </div>
  );
}
