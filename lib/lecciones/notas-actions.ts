"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function crearNota(params: {
  leccionId: string;
  contenido: string;
  timestampVideo?: number;
}) {
  const user = await requireAuth();

  const nota = await prisma.leccionNota.create({
    data: {
      userId: user.id,
      leccionId: params.leccionId,
      contenido: params.contenido,
      timestampVideo: params.timestampVideo ?? null,
    },
  });

  return { id: nota.id, contenido: nota.contenido, timestampVideo: nota.timestampVideo, createdAt: nota.createdAt };
}

export async function actualizarNota(id: string, contenido: string) {
  const user = await requireAuth();

  await prisma.leccionNota.update({
    where: { id, userId: user.id },
    data: { contenido },
  });

  return { ok: true };
}

export async function eliminarNota(id: string) {
  const user = await requireAuth();

  await prisma.leccionNota.delete({
    where: { id, userId: user.id },
  });

  return { ok: true };
}
