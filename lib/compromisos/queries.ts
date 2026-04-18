import { prisma } from "@/lib/prisma";

export async function listarCompromisosUsuario(userId: string) {
  return prisma.compromiso.findMany({
    where: { userId },
    orderBy: [{ estado: "asc" }, { fechaLimite: "asc" }],
    take: 100,
    include: {
      validadoPor: {
        select: { id: true, nombre: true, apellido: true },
      },
    },
  });
}

export async function listarCompromisosPorEstado(userId: string) {
  const todos = await listarCompromisosUsuario(userId);
  return {
    pendientes: todos.filter((c) => c.estado === "PENDIENTE"),
    porValidar: todos.filter((c) => c.estado === "CUMPLIDO_AUTO"),
    completados: todos
      .filter((c) => c.estado === "CUMPLIDO")
      .slice(0, 10),
    noCumplidos: todos.filter(
      (c) => c.estado === "ATRASADO" || c.estado === "NO_CUMPLIDO"
    ),
  };
}

export async function obtenerCompromisosPendientesValidacion(areaId: string) {
  return prisma.compromiso.findMany({
    where: {
      estado: "CUMPLIDO_AUTO",
      user: { areaId },
    },
    orderBy: { fechaCumplimiento: "asc" },
    include: {
      user: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          avatarUrl: true,
          puesto: { select: { nombre: true } },
        },
      },
    },
  });
}

export async function estadisticasMes(
  userId: string,
  mes: number,
  anio: number
) {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0, 23, 59, 59);
  const compromisos = await prisma.compromiso.findMany({
    where: { userId, createdAt: { gte: inicio, lte: fin } },
    select: { estado: true, puntosOtorgados: true },
  });
  const cumplidos = compromisos.filter((c) => c.estado === "CUMPLIDO").length;
  const puntos = compromisos.reduce((s, c) => s + c.puntosOtorgados, 0);
  return {
    total: compromisos.length,
    cumplidos,
    puntos,
    tasaCumplimiento:
      compromisos.length > 0 ? (cumplidos / compromisos.length) * 100 : 0,
  };
}
