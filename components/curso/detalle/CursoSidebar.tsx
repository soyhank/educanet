import Link from "next/link";
import { Clock, Sparkles, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CursoDetalleCompleto } from "@/types/cursos";

const nivelLabels = { BASICO: "Basico", INTERMEDIO: "Intermedio", AVANZADO: "Avanzado" };

export function CursoSidebar({
  curso,
  ctaHref,
  ctaLabel,
}: {
  curso: CursoDetalleCompleto;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <Card className="space-y-5 p-5">
      {/* CTA */}
      <Button size="lg" className="w-full" render={<Link href={ctaHref} />}>
        {ctaLabel}
      </Button>

      {/* Progress */}
      {curso.estado !== "no-iniciado" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{curso.porcentaje}%</span>
          </div>
          <Progress value={curso.porcentaje} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {curso.leccionesCompletadas} de {curso.totalLecciones} lecciones
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Duracion
          </span>
          <span className="font-medium">{curso.duracionMinutos} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Puntos
          </span>
          <span className="font-medium text-primary">
            {curso.puntosRecompensa}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            Idioma
          </span>
          <span className="font-medium">Espanol</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4" />
            Certificado
          </span>
          <span className="font-medium text-success">Si</span>
        </div>
      </div>

      {/* Nivel */}
      <div className="rounded-lg bg-muted/50 p-3 text-center text-sm">
        Nivel: <span className="font-medium">{nivelLabels[curso.nivel]}</span>
      </div>
    </Card>
  );
}
