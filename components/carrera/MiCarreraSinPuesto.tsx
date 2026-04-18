import { UserX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function MiCarreraSinPuesto() {
  return (
    <div className="mx-auto max-w-md py-16">
      <EmptyState
        icono={UserX}
        titulo="Aun no tienes un puesto asignado"
        descripcion="Contacta a RRHH para que te asignen tu puesto actual y puedas ver tu ruta de crecimiento."
        accion={{ label: "Explorar cursos", href: "/cursos" }}
      />
    </div>
  );
}
