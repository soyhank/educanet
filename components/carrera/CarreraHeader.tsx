import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
export function CarreraHeader({
  puestoNombre,
  areaNombre,
  fechaIngreso,
  puestoDestinoNombre,
}: {
  puestoNombre: string;
  areaNombre?: string | null;
  fechaIngreso?: Date | null;
  puestoDestinoNombre?: string;
}) {
  const antiguedad = fechaIngreso
    ? formatDistanceToNow(new Date(fechaIngreso), { locale: es })
    : null;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">
        Mi camino de crecimiento
      </h1>
      <p className="text-muted-foreground">
        Estas como <span className="font-medium text-foreground">{puestoNombre}</span>
        {areaNombre && ` en ${areaNombre}`}
        {antiguedad && ` desde hace ${antiguedad}`}
        {puestoDestinoNombre && (
          <>
            {" "}— tu proximo objetivo es{" "}
            <span className="font-medium text-primary">{puestoDestinoNombre}</span>
          </>
        )}
      </p>
    </div>
  );
}
