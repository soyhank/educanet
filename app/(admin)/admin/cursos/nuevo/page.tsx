import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CursoNuevoForm } from "./curso-nuevo-form";

export const metadata = { title: "Admin - Crear curso" };

export default async function AdminCursoNuevoPage() {
  await requireRole(["ADMIN"]);
  const areas = await prisma.area.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Crear nuevo curso</h1>
      <CursoNuevoForm areas={areas} />
    </div>
  );
}
