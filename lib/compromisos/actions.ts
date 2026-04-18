"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { procesarEvento } from "@/lib/gamificacion/motor";
import { getSemanaISO, getAnio } from "@/lib/gamificacion/periodo";
import { obtenerJefeUser } from "./jerarquia";

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const compromisoSchema = z.object({
  titulo: z.string().min(5, "Minimo 5 caracteres").max(200, "Maximo 200"),
  descripcion: z.string().max(500).optional(),
  fechaLimite: z.date(),
});

export const PUNTOS_COMPROMISO = {
  A_TIEMPO_VALIDADO: 25,
  A_TIEMPO_AUTO: 20,
  CON_RETRASO: 10,
  NO_CUMPLIDO: 0,
} as const;

export async function crearCompromiso(input: {
  titulo: string;
  descripcion?: string;
  fechaLimite: string; // ISO
}): Promise<Result<{ id: string }>> {
  const user = await requireAuth();
  const fecha = new Date(input.fechaLimite);
  if (Number.isNaN(fecha.getTime())) {
    return { success: false, error: "Fecha invalida" };
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) {
    return { success: false, error: "La fecha limite no puede ser pasada" };
  }

  const parsed = compromisoSchema.safeParse({
    titulo: input.titulo.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    fechaLimite: fecha,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { semana, anio } = getSemanaISO(new Date());

  const compromiso = await prisma.compromiso.create({
    data: {
      userId: user.id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion ?? null,
      fechaLimite: parsed.data.fechaLimite,
      semanaDelAnio: semana,
      anio,
    },
  });

  revalidatePath("/compromisos");
  return { success: true, data: { id: compromiso.id } };
}

export async function marcarCumplido(id: string): Promise<Result> {
  const user = await requireAuth();
  const c = await prisma.compromiso.findUnique({ where: { id } });
  if (!c) return { success: false, error: "No existe" };
  if (c.userId !== user.id) return { success: false, error: "No autorizado" };
  if (c.estado !== "PENDIENTE") {
    return { success: false, error: "Solo se marcan compromisos pendientes" };
  }

  await prisma.compromiso.update({
    where: { id },
    data: {
      autoReportadoCumplido: true,
      fechaCumplimiento: new Date(),
      estado: "CUMPLIDO_AUTO",
    },
  });

  // Notificar al jefe si existe
  const jefe = await obtenerJefeUser(user.id);
  if (jefe) {
    await prisma.notificacion.create({
      data: {
        userId: jefe.id,
        tipo: "LOGRO",
        titulo: "Compromiso pendiente de validacion",
        mensaje: `${user.nombre} ${user.apellido}: "${c.titulo}"`,
        url: "/compromisos?validar=1",
      },
    });
  }

  revalidatePath("/compromisos");
  return { success: true };
}

export async function eliminarCompromiso(id: string): Promise<Result> {
  const user = await requireAuth();
  const c = await prisma.compromiso.findUnique({
    where: { id },
    select: { userId: true, estado: true },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.userId !== user.id) return { success: false, error: "No autorizado" };
  if (c.estado !== "PENDIENTE") {
    return {
      success: false,
      error: "Solo se eliminan compromisos pendientes",
    };
  }
  await prisma.compromiso.delete({ where: { id } });
  revalidatePath("/compromisos");
  return { success: true };
}

function puntosSegunTiming(fechaCumplimiento: Date, fechaLimite: Date): number {
  const aTiempo = fechaCumplimiento.getTime() <= fechaLimite.getTime();
  return aTiempo ? PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO : PUNTOS_COMPROMISO.CON_RETRASO;
}

export async function validarCompromiso(input: {
  compromisoId: string;
  aprobar: boolean;
  comentario?: string;
}): Promise<Result> {
  const validador = await requireAuth();

  const c = await prisma.compromiso.findUnique({
    where: { id: input.compromisoId },
    include: { user: { select: { id: true, nombre: true, apellido: true } } },
  });
  if (!c) return { success: false, error: "No existe" };
  if (c.estado !== "CUMPLIDO_AUTO") {
    return { success: false, error: "No hay nada que validar en este estado" };
  }

  // Verificar que validador es jefe del user o admin
  const esAdmin = validador.rol === "ADMIN" || validador.rol === "RRHH";
  if (!esAdmin) {
    const jefe = await obtenerJefeUser(c.userId);
    if (!jefe || jefe.id !== validador.id) {
      return {
        success: false,
        error: "Solo tu jefe puede validar tus compromisos",
      };
    }
  }

  if (input.aprobar) {
    const puntos =
      c.fechaCumplimiento && c.fechaLimite
        ? puntosSegunTiming(c.fechaCumplimiento, c.fechaLimite)
        : PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO;

    await prisma.compromiso.update({
      where: { id: input.compromisoId },
      data: {
        estado: "CUMPLIDO",
        validadoPorId: validador.id,
        validadoEn: new Date(),
        validacionComentario: input.comentario ?? null,
        puntosOtorgados: puntos,
      },
    });

    await procesarEvento({
      userId: c.userId,
      tipo: "COMPROMISO_CUMPLIDO",
      fuente: "COMPROMISOS",
      puntosBrutos: puntos,
      referenciaId: c.id,
      descripcion: `Compromiso: ${c.titulo}`,
    });

    await prisma.notificacion.create({
      data: {
        userId: c.userId,
        tipo: "LOGRO",
        titulo: "Compromiso validado",
        mensaje: `"${c.titulo}" · +${puntos} pts`,
        url: "/compromisos",
      },
    });
  } else {
    await prisma.compromiso.update({
      where: { id: input.compromisoId },
      data: {
        estado: "NO_CUMPLIDO",
        validadoPorId: validador.id,
        validadoEn: new Date(),
        validacionComentario: input.comentario ?? null,
        puntosOtorgados: 0,
      },
    });

    await prisma.notificacion.create({
      data: {
        userId: c.userId,
        tipo: "SISTEMA",
        titulo: "Compromiso no validado",
        mensaje: `"${c.titulo}" · ${input.comentario ?? "Revisalo con tu jefe"}`,
        url: "/compromisos",
      },
    });
  }

  revalidatePath("/compromisos");
  return { success: true };
}

export async function autoValidarCompromisos(): Promise<{
  autoValidados: number;
  atrasados: number;
}> {
  await requireRole(["ADMIN", "RRHH"]);

  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const paraAutoValidar = await prisma.compromiso.findMany({
    where: {
      estado: "CUMPLIDO_AUTO",
      fechaCumplimiento: { lte: hace7Dias },
    },
    select: {
      id: true,
      userId: true,
      titulo: true,
      fechaCumplimiento: true,
      fechaLimite: true,
    },
  });

  let autoValidados = 0;
  for (const c of paraAutoValidar) {
    const aTiempo =
      c.fechaCumplimiento!.getTime() <= c.fechaLimite.getTime();
    const puntos = aTiempo
      ? PUNTOS_COMPROMISO.A_TIEMPO_AUTO
      : PUNTOS_COMPROMISO.CON_RETRASO;

    await prisma.compromiso.update({
      where: { id: c.id },
      data: {
        estado: "CUMPLIDO",
        validadoEn: new Date(),
        validacionComentario: "Auto-validado tras 7 dias sin revision",
        puntosOtorgados: puntos,
      },
    });

    await procesarEvento({
      userId: c.userId,
      tipo: "COMPROMISO_CUMPLIDO",
      fuente: "COMPROMISOS",
      puntosBrutos: puntos,
      referenciaId: c.id,
      descripcion: `Compromiso auto-validado: ${c.titulo}`,
    });
    autoValidados++;
  }

  const ahora = new Date();
  const atrasadosRes = await prisma.compromiso.updateMany({
    where: {
      estado: "PENDIENTE",
      fechaLimite: { lt: ahora },
    },
    data: { estado: "ATRASADO" },
  });

  return { autoValidados, atrasados: atrasadosRes.count };
}
