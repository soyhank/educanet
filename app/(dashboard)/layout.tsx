import { requireAuth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeartbeatTracker } from "@/components/dashboard/HeartbeatTracker";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const sidebarUser = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    puesto: user.puesto,
  };

  const headerUser = {
    ...sidebarUser,
    puntosTotales: user.puntosTotales,
    rachaActual: user.rachaActual,
  };

  return (
    <div className="flex min-h-full">
      <DashboardSidebar user={sidebarUser} />

      <div className="flex flex-1 flex-col md:pl-[260px]">
        <DashboardHeader user={headerUser} />
        <HeartbeatTracker />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
