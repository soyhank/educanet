import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CursoCard } from "@/components/curso/CursoCard";

type CursoEnProgreso = {
  slug: string;
  titulo: string;
  descripcionCorta: string | null;
  nivel: "BASICO" | "INTERMEDIO" | "AVANZADO";
  duracionMinutos: number;
  puntosRecompensa: number;
  instructorNombre: string;
  thumbnailUrl: string | null;
  porcentaje: number;
};

export function ContinuaDondeLoDejaste({
  cursos,
}: {
  cursos: CursoEnProgreso[];
}) {
  if (cursos.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Continua donde lo dejaste</h2>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aun no has empezado ningun curso
          </p>
          <Link
            href="/cursos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Explorar catalogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Continua donde lo dejaste</h2>
        <Link
          href="/cursos"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {cursos.map((curso) => (
          <div key={curso.slug} className="w-72 shrink-0 snap-start">
            <CursoCard {...curso} />
          </div>
        ))}
      </div>
    </section>
  );
}
