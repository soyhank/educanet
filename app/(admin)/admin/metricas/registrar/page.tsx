import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetricaRegistrarForm } from "./metrica-registrar-form";

export const metadata = { title: "Admin - Registrar metrica" };

export default async function RegistrarMetricaPage() {
  await requireRole(["ADMIN", "RRHH"]);

  const usuarios = await prisma.user.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, apellido: true, email: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Registrar metrica</h1>
      <MetricaRegistrarForm usuarios={usuarios} />
    </div>
  );
}
