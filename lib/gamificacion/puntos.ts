import { prisma } from "@/lib/prisma";
import type { RazonPuntos } from "@prisma/client";

/**
 * Level curve: pointsRequired(level) = 100 * level^1.5
 */
export function puntosParaNivel(nivel: number): number {
  return Math.round(100 * Math.pow(nivel, 1.5));
}

export function calcularNivel(puntos: number): number {
  let nivel = 1;
  while (puntosParaNivel(nivel + 1) <= puntos) {
    nivel++;
  }
  return nivel;
}

export function puntosParaSiguienteNivel(
  nivelActual: number,
  puntosActuales: number
): { puntosNecesarios: number; puntosFaltantes: number; progreso: number } {
  const puntosNecesarios = puntosParaNivel(nivelActual + 1);
  const puntosNivelActual = puntosParaNivel(nivelActual);
  const rango = puntosNecesarios - puntosNivelActual;
  const progreso = Math.min(
    100,
    Math.max(0, ((puntosActuales - puntosNivelActual) / rango) * 100)
  );
  const puntosFaltantes = Math.max(0, puntosNecesarios - puntosActuales);

  return { puntosNecesarios, puntosFaltantes, progreso };
}

export async function otorgarPuntos(params: {
  userId: string;
  cantidad: number;
  razon: RazonPuntos;
  descripcion?: string;
  referenciaId?: string;
}): Promise<{ nuevoTotal: number; subioDeNivel: boolean; nuevoNivel?: number }> {
  const result = await prisma.$transaction(async (tx) => {
    await tx.transaccionPuntos.create({
      data: {
        userId: params.userId,
        cantidad: params.cantidad,
        razon: params.razon,
        descripcion: params.descripcion ?? "",
        referenciaId: params.referenciaId,
      },
    });

    const user = await tx.user.update({
      where: { id: params.userId },
      data: { puntosTotales: { increment: params.cantidad } },
    });

    const nuevoNivel = calcularNivel(user.puntosTotales);
    const subioDeNivel = nuevoNivel > user.nivel;

    if (subioDeNivel) {
      await tx.user.update({
        where: { id: params.userId },
        data: { nivel: nuevoNivel },
      });

      await tx.notificacion.create({
        data: {
          userId: params.userId,
          tipo: "SUBIDA_NIVEL",
          titulo: `Subiste al nivel ${nuevoNivel}!`,
          mensaje: `Tu esfuerzo te llevo al nivel ${nuevoNivel}. Sigue asi!`,
          url: "/logros",
        },
      });
    }

    return { nuevoTotal: user.puntosTotales, subioDeNivel, nuevoNivel };
  });

  return result;
}
