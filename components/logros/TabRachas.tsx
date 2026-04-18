import { RachaIndicator } from "@/components/shared/RachaIndicator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function mensajeRacha(dias: number): string {
  if (dias === 0) return "Empieza hoy tu primera racha";
  if (dias <= 2) return "Estas comenzando! Manana suma otro dia";
  if (dias <= 6) return "Vas muy bien, manten el ritmo";
  if (dias <= 29) return "Eres constante — esto es habito";
  return "Imparable";
}

export function TabRachas({
  rachaActual,
  actividadDias,
}: {
  rachaActual: number;
  actividadDias: string[];
}) {
  const diasSet = new Set(actividadDias);

  // Build last 90 days grid
  const hoy = new Date();
  const dias: { fecha: string; activo: boolean }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dias.push({ fecha: key, activo: diasSet.has(key) });
  }

  return (
    <div className="space-y-8">
      {/* Current streak */}
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <RachaIndicator dias={rachaActual} size="lg" />
        <p className="text-2xl font-bold">
          {rachaActual} {rachaActual === 1 ? "dia" : "dias"} consecutivos
        </p>
        <p className="text-sm text-muted-foreground">
          {mensajeRacha(rachaActual)}
        </p>
      </Card>

      {/* Activity calendar */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Actividad de los ultimos 90 dias
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,16px)] gap-1">
          {dias.map((d) => (
            <div
              key={d.fecha}
              title={d.fecha}
              className={cn(
                "h-3.5 w-3.5 rounded-sm transition-colors",
                d.activo ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          Sin actividad
          <div className="h-3 w-3 rounded-sm bg-primary" />
          Con actividad
        </div>
      </div>
    </div>
  );
}
