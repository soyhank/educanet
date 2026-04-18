import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calcularCumplimiento, clasificarDesempeno } from "@/lib/desempeno/calculos";
import { cn } from "@/lib/utils";
import type { MetricaDesempeno } from "@prisma/client";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

function formatPeriodo(m: MetricaDesempeno): string {
  const fecha = new Date(m.fechaFin);
  const q = Math.ceil((fecha.getMonth() + 1) / 3);
  if (m.periodo === "TRIMESTRAL") return `Q${q} ${fecha.getFullYear()}`;
  if (m.periodo === "MENSUAL") {
    return fecha.toLocaleDateString("es", { month: "short", year: "numeric" });
  }
  return fecha.getFullYear().toString();
}

export function DesempenoMetricasActuales({
  metricas,
}: {
  metricas: MetricaDesempeno[];
}) {
  if (metricas.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Metricas del periodo actual</h2>
        <EmptyState
          icono={BarChart3}
          titulo="Pronto veras aqui tu progreso"
          descripcion="RRHH registrara tus metricas del periodo actual. Mientras tanto, sigue aprendiendo!"
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Metricas del periodo actual</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {metricas.map((m) => {
          const cumplimiento = calcularCumplimiento(m.valor, m.objetivo);
          const clasificacion = clasificarDesempeno(cumplimiento);

          return (
            <Card key={m.id} className={cn("p-5 space-y-3", m.objetivoAlcanzado && "border-success/20")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{m.nombre}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {formatPeriodo(m)}
                  </Badge>
                </div>
                {m.objetivoAlcanzado && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>

              {m.descripcion && (
                <p className="text-xs text-muted-foreground">{m.descripcion}</p>
              )}

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>
                    Actual: <span className="font-medium">{m.valor} {m.unidad}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Objetivo: {m.objetivo} {m.unidad}
                  </span>
                </div>
                <Progress value={Math.min(cumplimiento, 100)} className="h-2.5" />
              </div>

              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", clasificacion.color)}>
                  {cumplimiento}% — {clasificacion.etiqueta}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
