"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { procesarEvento } from "@/lib/gamificacion/motor";
import { getSemanaISO } from "@/lib/gamificacion/periodo";

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function completarMision(
  misionId: string
): Promise<Result<{ puntosOtorgados: number }>> {
  const user = await requireAuth();

  const mision = await prisma.mision.findUnique({
    where: { id: misionId },
  });
  if (!mision) return { success: false, error: "No existe" };
  if (mision.userId !== user.id) return { success: false, error: "No autorizada" };
  if (mision.estado !== "ACTIVA") {
    return { success: false, error: `Mision ${mision.estado.toLowerCase()}` };
  }

  // Validar meta segun tipo
  if (mision.metaValor) {
    if (mision.progresoActual < mision.metaValor) {
      return {
        success: false,
        error: `Progreso ${mision.progresoActual}/${mision.metaValor}. Aun no puedes completarla.`,
      };
    }
  }

  await prisma.mision.update({
    where: { id: misionId },
    data: { estado: "COMPLETADA", completadaEn: new Date() },
  });

  await procesarEvento({
    userId: user.id,
    tipo: "MISION_COMPLETADA",
    fuente: "MISIONES",
    puntosBrutos: mision.puntosRecompensa,
    referenciaId: misionId,
    descripcion: `Mision: ${mision.titulo}`,
  });

  await prisma.notificacion.create({
    data: {
      userId: user.id,
      tipo: "LOGRO",
      titulo: "Mision completada",
      mensaje: `${mision.titulo} · +${mision.puntosRecompensa} pts`,
      url: "/mi-progreso",
    },
  });

  revalidatePath("/mi-progreso");
  return {
    success: true,
    data: { puntosOtorgados: mision.puntosRecompensa },
  };
}

export async function descartarMision(misionId: string): Promise<Result> {
  const user = await requireAuth();
  const mision = await prisma.mision.findUnique({
    where: { id: misionId },
    select: { userId: true, semanaDelAnio: true, anio: true, estado: true },
  });
  if (!mision) return { success: false, error: "No existe" };
  if (mision.userId !== user.id) {
    return { success: false, error: "No autorizada" };
  }
  if (mision.estado !== "ACTIVA") {
    return { success: false, error: "Solo se descartan misiones activas" };
  }

  const cancelada = await prisma.mision.count({
    where: {
      userId: user.id,
      semanaDelAnio: mision.semanaDelAnio,
      anio: mision.anio,
      estado: "CANCELADA",
    },
  });
  if (cancelada >= 1) {
    return {
      success: false,
      error: "Solo puedes descartar 1 mision por semana",
    };
  }

  await prisma.mision.update({
    where: { id: misionId },
    data: { estado: "CANCELADA" },
  });
  revalidatePath("/mi-progreso");
  return { success: true };
}

export async function regenerarMisionesAhora(): Promise<Result<{ generadas: number }>> {
  const user = await requireAuth();
  const { generarMisionesSemanalesUsuario } = await import("./generador");
  const r = await generarMisionesSemanalesUsuario({ userId: user.id });
  revalidatePath("/mi-progreso");
  return { success: true, data: { generadas: r.generadas } };
}

export async function actualizarProgresoMision(
  misionId: string,
  incremento = 1
): Promise<Result> {
  const mision = await prisma.mision.findUnique({
    where: { id: misionId },
    select: {
      userId: true,
      estado: true,
      metaValor: true,
      progresoActual: true,
    },
  });
  if (!mision || mision.estado !== "ACTIVA") {
    return { success: false, error: "Mision no activa" };
  }

  const nuevoProgreso = mision.progresoActual + incremento;
  await prisma.mision.update({
    where: { id: misionId },
    data: { progresoActual: nuevoProgreso },
  });

  if (mision.metaValor && nuevoProgreso >= mision.metaValor) {
    // Auto-completar usando el motor
    const fresh = await prisma.mision.findUnique({
      where: { id: misionId },
      select: { userId: true, titulo: true, puntosRecompensa: true },
    });
    if (fresh) {
      await prisma.mision.update({
        where: { id: misionId },
        data: { estado: "COMPLETADA", completadaEn: new Date() },
      });
      await procesarEvento({
        userId: fresh.userId,
        tipo: "MISION_COMPLETADA",
        fuente: "MISIONES",
        puntosBrutos: fresh.puntosRecompensa,
        referenciaId: misionId,
        descripcion: `Mision: ${fresh.titulo}`,
      });
    }
  }

  return { success: true };
}
