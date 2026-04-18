import { CheckCircle, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PuestoEnCamino } from "@/types/carrera";

export function CarreraCaminoCompleto({
  puestos,
}: {
  puestos: PuestoEnCamino[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tu camino a largo plazo</h2>
        <p className="text-sm text-muted-foreground">
          Todos los puestos disponibles en tu area
        </p>
      </div>

      <div className="flex flex-col gap-0 sm:flex-row sm:items-center sm:gap-0">
        {puestos.map((puesto, i) => (
          <div key={puesto.id} className="flex items-center">
            {/* Node */}
            <div
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-3 text-center min-w-[120px]",
                puesto.esActual && "border-primary bg-primary/5 ring-2 ring-primary/20",
                puesto.esDestino && "border-primary/50 bg-primary/5",
                puesto.esFuturo && "border-dashed opacity-60"
              )}
            >
              {puesto.nivel < puestos.find((p) => p.esActual)!.nivel ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : puesto.esActual ? (
                <div className="h-5 w-5 rounded-full bg-primary animate-pulse" />
              ) : puesto.esDestino ? (
                <Circle className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground/40" />
              )}
              <p className={cn("text-sm font-medium", puesto.esActual && "text-primary")}>
                {puesto.nombre}
              </p>
              <p className="text-xs text-muted-foreground">Nivel {puesto.nivel}</p>
              {puesto.esActual && (
                <span className="text-[10px] font-medium text-primary">
                  Tu estas aqui
                </span>
              )}
            </div>

            {/* Connector */}
            {i < puestos.length - 1 && (
              <div className="hidden sm:block w-8 h-px bg-border mx-1" />
            )}
            {i < puestos.length - 1 && (
              <div className="sm:hidden mx-auto h-6 w-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
