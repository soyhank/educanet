import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificacionesLista } from "./notificaciones-lista";

export const metadata = { title: "Notificaciones" };

export default async function NotificacionesPage() {
  const user = await requireAuth();

  const notificaciones = await prisma.notificacion.findMany({
    where: { userId: user.id },
    orderBy: { fecha: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Notificaciones</h1>
      <NotificacionesLista notificaciones={notificaciones} />
    </div>
  );
}
