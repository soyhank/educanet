"use server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { otorgarPuntos } from "@/lib/gamificacion/puntos";
import { revalidatePath } from "next/cache";
import type { RolUsuario } from "@prisma/client";

export async function actualizarUsuario(
  id: string,
  data: {
    nombre?: string;
    apellido?: string;
    puestoId?: string | null;
    areaId?: string | null;
    activo?: boolean;
  }
) {
  await requireRole(["ADMIN", "RRHH"]);

  let payload = { ...data };

  // Derive areaId from the puesto so the user appears in the correct team view
  if (data.puestoId) {
    const puesto = await prisma.puesto.findUnique({
      where: { id: data.puestoId },
      select: { areaId: true },
    });
    if (puesto) payload.areaId = puesto.areaId;
  } else if (data.puestoId === null) {
    payload.areaId = null;
  }

  await prisma.user.update({ where: { id }, data: payload });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
}

export async function actualizarRolUsuario(id: string, rol: RolUsuario) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: { rol } });
  revalidatePath("/admin/usuarios");
}

export async function otorgarPuntosManual(params: {
  userId: string;
  cantidad: number;
  descripcion: string;
}) {
  await requireRole(["ADMIN"]);
  await otorgarPuntos({
    userId: params.userId,
    cantidad: params.cantidad,
    razon: "AJUSTE_ADMIN",
    descripcion: params.descripcion,
  });
  revalidatePath("/admin/usuarios");
}

export async function otorgarBadgeManual(userId: string, badgeId: string) {
  await requireRole(["ADMIN"]);

  const existe = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  });
  if (existe) return { error: "El usuario ya tiene este badge" };

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  if (!badge) return { error: "Badge no encontrado" };

  await prisma.userBadge.create({ data: { userId, badgeId } });

  await otorgarPuntos({
    userId,
    cantidad: badge.puntosRecompensa,
    razon: "AJUSTE_ADMIN",
    descripcion: `Badge otorgado manualmente: ${badge.nombre}`,
    referenciaId: badgeId,
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function desactivarUsuario(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin/usuarios");
}

export async function reactivarUsuario(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: { activo: true } });
  revalidatePath("/admin/usuarios");
}
