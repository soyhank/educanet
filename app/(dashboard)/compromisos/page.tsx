import { requireAuth } from "@/lib/auth";
import { listarCompromisosPorEstado } from "@/lib/compromisos/queries";
import { CompromisosCliente } from "@/components/compromisos/CompromisosCliente";

export const metadata = { title: "Compromisos" };

export default async function CompromisosPage() {
  const user = await requireAuth();

  const { propuestas, pendientes, porValidar, completados, noCumplidos } =
    await listarCompromisosPorEstado(user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CompromisosCliente
        propuestas={propuestas}
        pendientes={pendientes}
        porValidar={porValidar}
        completados={completados}
        noCumplidos={noCumplidos}
      />
    </div>
  );
}
