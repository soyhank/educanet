import { CursoCard } from "@/components/curso/CursoCard";

type CursoRec = {
  slug: string;
  titulo: string;
  descripcionCorta: string | null;
  nivel: "BASICO" | "INTERMEDIO" | "AVANZADO";
  duracionMinutos: number;
  puntosRecompensa: number;
  instructorNombre: string;
  thumbnailUrl: string | null;
};

export function RecomendadosParaTi({
  cursos,
  puestoNombre,
}: {
  cursos: CursoRec[];
  puestoNombre?: string;
}) {
  if (cursos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Recomendado para ti</h2>
        {puestoNombre && (
          <p className="text-sm text-muted-foreground">
            Basado en tu puesto de {puestoNombre}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <CursoCard key={curso.slug} {...curso} />
        ))}
      </div>
    </section>
  );
}
