import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CursoEnRuta } from "@/types/carrera";

const nivelLabels = { BASICO: "Basico", INTERMEDIO: "Intermedio", AVANZADO: "Avanzado" };

export function CarreraCursosRequeridos({
  cursos,
}: {
  cursos: CursoEnRuta[];
}) {
  const requeridos = cursos.filter((c) => c.requerido);
  const complementarios = cursos.filter((c) => !c.requerido);

  const sorted = [...requeridos].sort((a, b) => {
    if (a.estado === "completado" && b.estado !== "completado") return 1;
    if (a.estado !== "completado" && b.estado === "completado") return -1;
    return a.orden - b.orden;
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Cursos de tu ruta</h2>

      <div className="space-y-2">
        {sorted.map((c) => (
          <Link
            key={c.cursoId}
            href={`/cursos/${c.curso.slug}`}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
              c.estado === "completado" && "bg-success/5 border-success/20"
            )}
          >
            {c.estado === "completado" ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-success" />
            ) : (
              <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.curso.titulo}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Badge variant="outline" className="text-[10px]">
                  {nivelLabels[c.curso.nivel]}
                </Badge>
                <span>{c.curso.duracionMinutos} min</span>
                <span>{c.curso.instructorNombre}</span>
              </div>
              {c.estado === "en-progreso" && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={c.porcentaje} className="h-1 flex-1" />
                  <span className="text-xs text-muted-foreground">{c.porcentaje}%</span>
                </div>
              )}
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {complementarios.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cursos complementarios sugeridos
          </h3>
          {complementarios.map((c) => (
            <Link
              key={c.cursoId}
              href={`/cursos/${c.curso.slug}`}
              className="flex items-center gap-4 rounded-lg border border-dashed p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 truncate">{c.curso.titulo}</div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
