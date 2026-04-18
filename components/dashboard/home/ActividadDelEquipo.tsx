import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Actividad = {
  id: string;
  descripcion: string;
  fecha: Date | string;
  user: { nombre: string; apellido: string };
};

export function ActividadDelEquipo({
  actividad,
}: {
  actividad: Actividad[];
}) {
  if (actividad.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">En tu equipo</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente en tu equipo
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">En tu equipo</h2>
      <div className="space-y-3">
        {actividad.map((a) => {
          const initials = `${a.user.nombre[0]}${a.user.apellido[0]}`.toUpperCase();
          return (
            <div key={a.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-muted text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {a.user.nombre} {a.user.apellido}
                  </span>{" "}
                  {a.descripcion}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(a.fecha), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
