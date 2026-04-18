import { CursoCard } from "@/components/curso/CursoCard";
import type { CursoListado } from "@/types/cursos";

export function CursosSimilares({ cursos }: { cursos: CursoListado[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Continua aprendiendo</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CursoCard
            key={curso.slug}
            slug={curso.slug}
            titulo={curso.titulo}
            descripcionCorta={curso.descripcionCorta}
            nivel={curso.nivel}
            duracionMinutos={curso.duracionMinutos}
            puntosRecompensa={curso.puntosRecompensa}
            instructorNombre={curso.instructorNombre}
            porcentaje={curso.porcentaje}
            thumbnailUrl={
              curso.thumbnailUrl ??
              `https://picsum.photos/seed/${curso.slug}/800/450`
            }
          />
        ))}
      </div>
    </section>
  );
}
