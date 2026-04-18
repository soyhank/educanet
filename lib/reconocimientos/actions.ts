"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { procesarEvento } from "@/lib/gamificacion/motor";
import { getSemanaISO, getAnio } from "@/lib/gamificacion/periodo";
import { reconocimientoSchema } from "./schemas";
import { puedeNominarEstaSemana } from "./queries";

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const PUNTOS_RECONOCIMIENTO = 30;

export async function crearReconocimiento(input: {
  reconocidoEmail: string;
  categoriaId: string;
  mensaje: string;
  visibilidad?: "PUBLICO" | "PRIVADO";
}): Promise<Result<{ reconocimientoId: string }>> {
  const nominador = await requireAuth();

  const parsed = reconocimientoSchema.safeParse({
    reconocidoEmail: input.reconocidoEmail,
    categoriaId: input.categoriaId,
    mensaje: input.mensaje.trim(),
    visibilidad: input.visibilidad ?? "PUBLICO",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const reconocido = await prisma.user.findUnique({
    where: { email: parsed.data.reconocidoEmail },
    select: { id: true, areaId: true, nombre: true, apellido: true },
  });
  if (!reconocido) {
    return { success: false, error: "No encontramos a esa persona" };
  }

  if (!nominador.areaId || reconocido.areaId !== nominador.areaId) {
    return {
      success: false,
      error: "Solo puedes reconocer a miembros de tu area",
    };
  }

  const ahora = new Date();
  const { semana, anio } = getSemanaISO(ahora);

  const check = await puedeNominarEstaSemana({
    nominadorId: nominador.id,
    reconocidoId: reconocido.id,
    anio,
    semana,
  });
  if (!check.puede) return { success: false, error: check.razon! };

  const categoria = await prisma.categoriaReconocimiento.findUnique({
    where: { id: parsed.data.categoriaId },
    select: { id: true, nombre: true, emoji: true },
  });
  if (!categoria) return { success: false, error: "Categoria invalida" };

  const rec = await prisma.reconocimiento.create({
    data: {
      nominadorId: nominador.id,
      reconocidoId: reconocido.id,
      categoriaId: categoria.id,
      mensaje: parsed.data.mensaje,
      semanaDelAnio: semana,
      anio,
      puntosOtorgados: PUNTOS_RECONOCIMIENTO,
      visibilidad: parsed.data.visibilidad,
    },
  });

  await procesarEvento({
    userId: reconocido.id,
    tipo: "RECONOCIMIENTO_RECIBIDO",
    fuente: "RECONOCIMIENTOS",
    puntosBrutos: PUNTOS_RECONOCIMIENTO,
    referenciaId: rec.id,
    descripcion: `Reconocimiento de ${nominador.nombre} ${nominador.apellido}`,
    metadatos: {
      nominadorNombre: `${nominador.nombre} ${nominador.apellido}`,
      categoria: categoria.nombre,
      mensaje: parsed.data.mensaje.slice(0, 200),
    },
  });

  await prisma.notificacion.create({
    data: {
      userId: reconocido.id,
      tipo: "LOGRO",
      titulo: `${nominador.nombre} te reconocio`,
      mensaje: `${categoria.emoji ?? "✨"} ${categoria.nombre}: ${parsed.data.mensaje.slice(0, 80)}...`,
      url: "/reconocimientos?tab=recibidos",
    },
  });

  // Hook de misiones: el nominador puede tener mision RECONOCER_PEER
  try {
    const { verificarMisionesTrasEvento } = await import(
      "@/lib/misiones/hooks"
    );
    await verificarMisionesTrasEvento({
      userId: nominador.id,
      tipoEvento: "RECONOCIMIENTO_RECIBIDO",
      referenciaId: rec.id,
    });
  } catch {
    // Silencioso: si falla el hook no bloquea la accion principal
  }

  revalidatePath("/reconocimientos");
  revalidatePath("/mi-progreso");
  return { success: true, data: { reconocimientoId: rec.id } };
}

export async function eliminarReconocimiento(id: string): Promise<Result> {
  const user = await requireAuth();
  const existente = await prisma.reconocimiento.findUnique({
    where: { id },
    select: { nominadorId: true },
  });
  if (!existente) return { success: false, error: "No existe" };
  const esAdmin = user.rol === "ADMIN" || user.rol === "RRHH";
  if (existente.nominadorId !== user.id && !esAdmin) {
    return { success: false, error: "No autorizado" };
  }
  await prisma.reconocimiento.delete({ where: { id } });
  revalidatePath("/reconocimientos");
  return { success: true };
}
