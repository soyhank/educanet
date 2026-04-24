import { prisma } from "@/lib/prisma";

export async function verificarEsJefeDe(
  jefeId: string,
  empleadoId: string
): Promise<boolean> {
  const [jefe, empleado] = await Promise.all([
    prisma.user.findUnique({
      where: { id: jefeId },
      select: { areaId: true, puesto: { select: { nombre: true } } },
    }),
    prisma.user.findUnique({
      where: { id: empleadoId },
      select: { areaId: true },
    }),
  ]);

  if (!jefe?.areaId || !empleado?.areaId) return false;
  if (jefe.areaId !== empleado.areaId) return false;
  if (!jefe.puesto?.nombre.startsWith("Jefe")) return false;

  return true;
}

export async function obtenerEquipoIds(jefeId: string): Promise<string[]> {
  const jefe = await prisma.user.findUnique({
    where: { id: jefeId },
    select: { areaId: true },
  });

  if (!jefe?.areaId) return [];

  const miembros = await prisma.user.findMany({
    where: {
      areaId: jefe.areaId,
      id: { not: jefeId },
      activo: true,
    },
    select: { id: true },
  });

  return miembros.map((m) => m.id);
}
