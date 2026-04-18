import { requireAuth } from "@/lib/auth";
import {
  listarCompromisosPorEstado,
  obtenerCompromisosPendientesValidacion,
} from "@/lib/compromisos/queries";
import { CompromisosCliente } from "@/components/compromisos/CompromisosCliente";
import { PanelValidacionJefe } from "@/components/compromisos/PanelValidacionJefe";

export const metadata = { title: "Compromisos" };

export default async function CompromisosPage() {
  const user = await requireAuth();

  const { pendientes, porValidar, completados, noCumplidos } =
    await listarCompromisosPorEstado(user.id);

  const esJefe = user.puesto?.nombre?.startsWith("Jefe") ?? false;
  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";

  const pendientesEquipo =
    (esJefe || esAdmin) && user.areaId
      ? await obtenerCompromisosPendientesValidacion(user.areaId)
      : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {pendientesEquipo.length > 0 && (
        <PanelValidacionJefe pendientes={pendientesEquipo} />
      )}

      <CompromisosCliente
        pendientes={pendientes}
        porValidar={porValidar}
        completados={completados}
        noCumplidos={noCumplidos}
      />
    </div>
  );
}
