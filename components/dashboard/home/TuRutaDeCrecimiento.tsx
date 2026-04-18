import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type RutaProps = {
  titulo: string;
  puestoDestinoNombre: string;
  progreso: number;
  cursosRequeridos: { titulo: string; completado: boolean }[];
  metricas: { nombre: string; valor: number; objetivo: number; unidad: string }[];
};

export function TuRutaDeCrecimiento({ ruta }: { ruta: RutaProps | null }) {
  if (!ruta) {
    return (
      <section className="rounded-xl border border-dashed p-6 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Tu ruta de crecimiento</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aun no tienes una ruta de carrera asignada. Habla con RRHH para
          definir tu plan de crecimiento.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Tu camino a {ruta.puestoDestinoNombre}
          </h2>
          <p className="text-sm text-muted-foreground">{ruta.titulo}</p>
        </div>
        <Badge variant="outline" className="w-fit text-primary">
          {ruta.progreso}% completado
        </Badge>
      </div>

      <Progress value={ruta.progreso} className="h-2.5" />

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Cursos pendientes */}
        {ruta.cursosRequeridos
          .filter((c) => !c.completado)
          .slice(0, 2)
          .map((c) => (
            <div
              key={c.titulo}
              className="flex items-center gap-2 rounded-lg border bg-card p-3"
            >
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-sm">{c.titulo}</span>
            </div>
          ))}

        {/* Metricas pendientes */}
        {ruta.metricas.slice(0, 2).map((m) => (
          <div
            key={m.nombre}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <span className="text-sm">{m.nombre}</span>
            <span className="text-sm font-medium">
              {m.valor}/{m.objetivo} {m.unidad}
            </span>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" render={<Link href="/mi-carrera" />}>
        Ver mi plan completo <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </section>
  );
}
