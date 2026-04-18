import { requireAuth } from "@/lib/auth";
import {
  obtenerMetricasPeriodoActual,
  obtenerHistoricoMetricas,
  obtenerResumenDesempeno,
} from "@/lib/desempeno/queries";
import { DesempenoHeader } from "@/components/desempeno/DesempenoHeader";
import { DesempenoResumen } from "@/components/desempeno/DesempenoResumen";
import { DesempenoMetricasActuales } from "@/components/desempeno/DesempenoMetricasActuales";
import { DesempenoHistorico } from "@/components/desempeno/DesempenoHistorico";

export const metadata = { title: "Mi desempeno" };

export default async function DesempenoPage() {
  const user = await requireAuth();

  const [metricas, historico, resumen] = await Promise.all([
    obtenerMetricasPeriodoActual(user.id),
    obtenerHistoricoMetricas(user.id),
    obtenerResumenDesempeno(user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <DesempenoHeader
        porcentajeCumplimiento={resumen.porcentajeCumplimiento}
      />
      <DesempenoResumen resumen={resumen} />
      <DesempenoMetricasActuales metricas={metricas} />
      {historico.length > 0 && <DesempenoHistorico metricas={historico} />}
    </div>
  );
}
