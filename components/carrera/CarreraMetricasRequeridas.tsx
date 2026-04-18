import { TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MetricaEnRuta } from "@/types/carrera";

export function CarreraMetricasRequeridas({
  metricas,
}: {
  metricas: MetricaEnRuta[];
}) {
  if (metricas.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Metricas que debes alcanzar</h2>
        <p className="text-sm text-muted-foreground">
          Estas metricas las evalua RRHH periodicamente
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {metricas.map((m) => {
          const cumplimiento =
            m.valorActual !== null
              ? Math.min(100, Math.round((m.valorActual / m.valorObjetivo) * 100))
              : 0;
          const noData = m.valorActual === null;

          return (
            <Card key={m.id} className={cn("p-4 space-y-3", m.cumplida && "border-success/20 bg-success/5")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {m.cumplida ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">{m.nombre}</p>
                </div>
              </div>

              {m.descripcion && (
                <p className="text-xs text-muted-foreground">{m.descripcion}</p>
              )}

              {noData ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Pendiente de evaluacion por RRHH
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {m.valorActual} / {m.valorObjetivo} {m.unidad}
                    </span>
                    <span className={cn(
                      "font-medium",
                      m.cumplida ? "text-success" : cumplimiento >= 75 ? "text-primary" : "text-amber-500"
                    )}>
                      {cumplimiento}%
                    </span>
                  </div>
                  <Progress
                    value={cumplimiento}
                    className={cn("h-2", m.cumplida && "[&>div]:bg-success")}
                  />
                </>
              )}

              <p className="text-xs text-muted-foreground capitalize">
                Periodo: {m.periodo.toLowerCase()}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
