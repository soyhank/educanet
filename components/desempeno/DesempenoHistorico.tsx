import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricaDesempeno } from "@prisma/client";

export function DesempenoHistorico({
  metricas,
}: {
  metricas: MetricaDesempeno[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Historico</h2>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Metrica</th>
                <th className="px-4 py-3 text-left font-medium">Periodo</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-right font-medium">Objetivo</th>
                <th className="px-4 py-3 text-right font-medium">Cumplimiento</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map((m) => {
                const cumplimiento = Math.round(
                  (m.valor / m.objetivo) * 100
                );
                const fechaFin = new Date(m.fechaFin);
                const q = Math.ceil((fechaFin.getMonth() + 1) / 3);
                const periodo =
                  m.periodo === "TRIMESTRAL"
                    ? `Q${q} ${fechaFin.getFullYear()}`
                    : fechaFin.toLocaleDateString("es", {
                        month: "short",
                        year: "numeric",
                      });

                return (
                  <tr key={m.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{m.nombre}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {periodo}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.valor} {m.unidad}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {m.objetivo} {m.unidad}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium",
                        cumplimiento >= 100
                          ? "text-success"
                          : cumplimiento >= 75
                            ? "text-primary"
                            : "text-amber-500"
                      )}
                    >
                      {cumplimiento}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.objetivoAlcanzado ? (
                        <CheckCircle className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
