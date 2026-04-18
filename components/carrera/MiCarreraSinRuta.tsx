import { Map } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function MiCarreraSinRuta() {
  return (
    <EmptyState
      icono={Map}
      titulo="Aun no hay una ruta de crecimiento para tu puesto"
      descripcion="Nuestro equipo de RRHH esta trabajando en definir tu plan de crecimiento. Mientras tanto, explora los cursos disponibles."
      accion={{ label: "Explorar cursos", href: "/cursos" }}
    />
  );
}
