import { FileText, Link2, Download, FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RecursoDetalle } from "@/types/cursos";

const tipoIconos = {
  PDF: FileText,
  ENLACE: Link2,
  DESCARGA: Download,
};

export function CursoRecursos({
  recursos,
}: {
  recursos: RecursoDetalle[];
}) {
  if (recursos.length === 0) {
    return (
      <EmptyState
        icono={FolderOpen}
        titulo="Sin recursos"
        descripcion="Este curso no tiene recursos adicionales."
      />
    );
  }

  // Group by module
  const porModulo = recursos.reduce<Record<string, RecursoDetalle[]>>(
    (acc, r) => {
      const key = r.moduloTitulo;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(porModulo).map(([moduloTitulo, recs]) => (
        <div key={moduloTitulo}>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            {moduloTitulo}
          </h4>
          <div className="space-y-2">
            {recs.map((r) => {
              const Icon = tipoIconos[r.tipo];
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{r.nombre}</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
