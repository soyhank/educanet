import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { TransaccionPuntos } from "@prisma/client";

const razonLabels: Record<string, { label: string; color: string }> = {
  COMPLETAR_LECCION: { label: "Leccion", color: "bg-primary/10 text-primary" },
  APROBAR_QUIZ: { label: "Quiz", color: "bg-secondary text-secondary-foreground" },
  COMPLETAR_CURSO: { label: "Curso", color: "bg-success/10 text-success" },
  RACHA_DIAS: { label: "Racha", color: "bg-amber-500/10 text-amber-600" },
  LOGRO_OBJETIVO: { label: "Objetivo", color: "bg-primary/10 text-primary" },
  AJUSTE_ADMIN: { label: "Ajuste", color: "bg-muted text-muted-foreground" },
  COMPLETAR_RUTA: { label: "Ruta", color: "bg-success/10 text-success" },
  SUBIDA_NIVEL: { label: "Nivel", color: "bg-primary/10 text-primary" },
};

export function TabHistorialPuntos({
  transacciones,
}: {
  transacciones: TransaccionPuntos[];
}) {
  if (transacciones.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Tu historial de puntos aparecera aqui
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Razon</th>
              <th className="px-4 py-3 text-right font-medium">Puntos</th>
              <th className="px-4 py-3 text-left font-medium">Descripcion</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => {
              const razon = razonLabels[t.razon] ?? {
                label: t.razon,
                color: "bg-muted text-muted-foreground",
              };
              return (
                <tr key={t.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(t.fecha), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={razon.color}>
                      {razon.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary">
                    +{t.cantidad}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                    {t.descripcion}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
