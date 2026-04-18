import Link from "next/link";
import { BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SiguientePaso } from "@/types/carrera";

export function CarreraSiguientesPasos({
  pasos,
}: {
  pasos: SiguientePaso[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tus proximos pasos</h2>
        <p className="text-sm text-muted-foreground">
          Las acciones mas impactantes para avanzar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((paso, i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {paso.tipo === "CURSO" ? (
                <div className="rounded-lg bg-primary/10 p-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{paso.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {paso.descripcion}
                </p>
              </div>
            </div>

            {paso.progresoActual !== undefined && paso.tipo === "CURSO" && (
              <Progress value={paso.progresoActual} className="h-1.5" />
            )}

            {paso.url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href={paso.url} />}
              >
                {paso.progresoActual && paso.progresoActual > 0
                  ? "Continuar"
                  : "Empezar"}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}

            {paso.tipo === "METRICA" && (
              <p className="text-xs text-muted-foreground text-center">
                Evaluada por RRHH
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
