import Link from "next/link";
import { Clock, Sparkles, BookOpen, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CursoDetalleCompleto } from "@/types/cursos";

const nivelLabels = { BASICO: "Basico", INTERMEDIO: "Intermedio", AVANZADO: "Avanzado" };

export function CursoHero({ curso }: { curso: CursoDetalleCompleto }) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/10 p-6 sm:p-10">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/cursos" className="hover:text-foreground">
          Catalogo
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{curso.titulo}</span>
      </nav>

      <div className="flex items-start gap-2">
        {curso.area && (
          <Badge variant="outline" className="mb-3">
            {curso.area.nombre}
          </Badge>
        )}
        {curso.estado === "completado" && (
          <Badge className="bg-success text-success-foreground mb-3">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completado
          </Badge>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {curso.titulo}
      </h1>

      {curso.descripcionCorta && (
        <p className="mt-2 max-w-2xl text-muted-foreground sm:text-lg">
          {curso.descripcionCorta}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {nivelLabels[curso.nivel]}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {curso.duracionMinutos} min
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-primary" />
          {curso.puntosRecompensa} puntos
        </span>
        <span>{curso.totalLecciones} lecciones</span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Por {curso.instructorNombre}
      </p>
    </section>
  );
}
