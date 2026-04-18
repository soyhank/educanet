import { SearchX } from "lucide-react";
import { CursoCard } from "./CursoCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CursoListado } from "@/types/cursos";

export function CursoGrid({ cursos }: { cursos: CursoListado[] }) {
  if (cursos.length === 0) {
    return (
      <EmptyState
        icono={SearchX}
        titulo="Sin resultados"
        descripcion="No encontramos cursos con esos filtros. Intenta con otros criterios."
        accion={{ label: "Ver todos los cursos", href: "/cursos" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
  );
}
