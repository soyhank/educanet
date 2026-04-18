import { BookX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function CursoNotFound() {
  return (
    <div className="mx-auto max-w-md py-16">
      <EmptyState
        icono={BookX}
        titulo="Curso no encontrado"
        descripcion="El curso que buscas no existe o fue eliminado."
        accion={{ label: "Volver al catalogo", href: "/cursos" }}
      />
    </div>
  );
}
