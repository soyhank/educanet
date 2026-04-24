import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { obtenerTareaDetalle, obtenerCompanerosArea } from "@/lib/tareas/queries";
import { Button } from "@/components/ui/button";
import { DetalleTareaClient } from "@/components/tareas/DetalleTareaClient";

export const metadata = { title: "Detalle de tarea" };

export default async function TareaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const data = await obtenerTareaDetalle(id, user.id);
  if (!data) notFound();
  if (!data.esPropia) redirect("/unauthorized");

  const { tarea } = data;

  const companeros = user.areaId
    ? await obtenerCompanerosArea({ areaId: user.areaId, excluirUserId: user.id })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/tareas" />}>
        <ArrowLeft />
        Volver al kanban
      </Button>

      <DetalleTareaClient tarea={tarea} companeros={companeros} />
    </div>
  );
}
