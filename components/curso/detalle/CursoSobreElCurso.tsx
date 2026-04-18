import { Check } from "lucide-react";
import type { CursoDetalleCompleto } from "@/types/cursos";

export function CursoSobreElCurso({
  curso,
}: {
  curso: CursoDetalleCompleto;
}) {
  // Generate learning outcomes from module titles
  const aprendizajes = curso.modulos.map(
    (m) => m.titulo
  );

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Descripcion</h3>
        <p className="text-muted-foreground leading-relaxed">
          {curso.descripcion}
        </p>
      </div>

      {/* What you'll learn */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Lo que aprenderas</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {aprendizajes.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prerequisites */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Requisitos previos</h3>
        <p className="text-sm text-muted-foreground">
          {curso.nivel === "BASICO"
            ? "No se requieren conocimientos previos. Este curso es ideal para comenzar."
            : curso.nivel === "INTERMEDIO"
              ? "Se recomienda tener conocimientos basicos del area. Si eres nuevo, te sugerimos comenzar con el curso de induccion."
              : "Se requiere experiencia previa en el area. Asegurate de haber completado los cursos intermedios antes de continuar."}
        </p>
      </div>

      {/* Instructor */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Instructor</h3>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {curso.instructorNombre[0]}
          </div>
          <div>
            <p className="font-medium">{curso.instructorNombre}</p>
            <p className="text-sm text-muted-foreground">Instructor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
