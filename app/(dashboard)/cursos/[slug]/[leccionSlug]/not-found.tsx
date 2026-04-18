import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function LeccionNotFound() {
  return (
    <div className="mx-auto max-w-md py-16">
      <EmptyState
        icono={FileQuestion}
        titulo="Leccion no encontrada"
        descripcion="La leccion que buscas no existe o fue eliminada."
        accion={{ label: "Volver al curso", href: "/cursos" }}
      />
    </div>
  );
}
