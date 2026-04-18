"use server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { otorgarPuntos } from "@/lib/gamificacion/puntos";
import { revalidatePath } from "next/cache";
import type { PeriodoMetrica } from "@prisma/client";

export async function registrarMetrica(params: {
  userId: string;
  tipo: string;
  nombre: string;
  descripcion?: string;
  valor: number;
  objetivo: number;
  unidad: string;
  periodo: PeriodoMetrica;
  fechaInicio: Date;
  fechaFin: Date;
}) {
  await requireRole(["ADMIN", "RRHH"]);

  const objetivoAlcanzado = params.valor >= params.objetivo;

  const metrica = await prisma.metricaDesempeno.create({
    data: {
      ...params,
      objetivoAlcanzado,
    },
  });

  if (objetivoAlcanzado) {
    await otorgarPuntos({
      userId: params.userId,
      cantidad: 75,
      razon: "LOGRO_OBJETIVO",
      descripcion: `Objetivo cumplido: ${params.nombre}`,
      referenciaId: metrica.id,
    });

    await prisma.notificacion.create({
      data: {
        userId: params.userId,
        tipo: "OBJETIVO_CUMPLIDO",
        titulo: "Objetivo cumplido!",
        mensaje: `Has alcanzado tu objetivo de ${params.nombre}. Felicidades!`,
        url: "/desempeno",
      },
    });
  }

  revalidatePath("/desempeno");
  return metrica;
}
