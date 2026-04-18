import { prisma } from "@/lib/prisma";

/**
 * Busca al "jefe" del usuario: alguien de la misma area cuyo puesto
 * empieza con "Jefe". Simplificacion del piloto.
 */
export async function obtenerJefeUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { areaId: true },
  });
  if (!user?.areaId) return null;

  return prisma.user.findFirst({
    where: {
      areaId: user.areaId,
      activo: true,
      id: { not: userId },
      puesto: { nombre: { startsWith: "Jefe" } },
    },
    select: { id: true, nombre: true, apellido: true, email: true },
  });
}
