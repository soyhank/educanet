import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ejecutarCalculoAutomatico } from "@/lib/kpis/auto-calculos";
import { getSemanaISO, mesActual } from "@/lib/gamificacion/periodo";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { semana, anio } = getSemanaISO(new Date());
  const { mes } = mesActual();

  const asignaciones = await prisma.kpiAsignacion.findMany({
    where: {
      periodoMes: mes,
      periodoAnio: anio,
      definicion: {
        tipoFuente: "AUTO_CALCULADO",
        funcionCalculo: { not: null },
      },
    },
    include: { definicion: { select: { funcionCalculo: true, codigo: true } } },
  });

  let procesados = 0;
  let errores = 0;

  for (const asig of asignaciones) {
    try {
      const { valor, snapshot } = await ejecutarCalculoAutomatico({
        funcionNombre: asig.definicion.funcionCalculo!,
        userId: asig.userId,
        mes,
        anio,
      });

      await prisma.kpiRegistroSemanal.upsert({
        where: {
          asignacionId_semanaDelAnio_anio: {
            asignacionId: asig.id,
            semanaDelAnio: semana,
            anio,
          },
        },
        create: {
          asignacionId: asig.id,
          semanaDelAnio: semana,
          anio,
          valor,
          reportadoPorId: asig.userId,
          estadoValidacion: "AUTO_VALIDADO",
          calculoAutomatico: true,
          snapshotDataFuente: snapshot as Prisma.InputJsonValue,
        },
        update: {
          valor,
          estadoValidacion: "AUTO_VALIDADO",
          calculoAutomatico: true,
          snapshotDataFuente: snapshot as Prisma.InputJsonValue,
        },
      });

      procesados++;
    } catch (error) {
      console.error(
        `[kpis-autoreporte] Error en ${asig.definicion.codigo}:`,
        error instanceof Error ? error.message : error
      );
      errores++;
    }
  }

  return NextResponse.json({ ok: true, procesados, errores, semana, anio });
}
