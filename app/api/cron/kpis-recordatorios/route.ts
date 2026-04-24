import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hoy = new Date();

  const pendientes = await prisma.kpiRegistroSemanal.findMany({
    where: { estadoValidacion: "PENDIENTE" },
    include: {
      asignacion: {
        include: { user: { select: { id: true, areaId: true } } },
      },
    },
  });

  // Agrupar por jefe para no spamear: una notificación por jefe por ciclo
  const notificadosPorJefeYDia = new Map<string, number>();

  for (const registro of pendientes) {
    const diasPendiente = Math.floor(
      (hoy.getTime() - registro.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (![3, 5, 7].includes(diasPendiente)) continue;

    const empleadoAreaId = registro.asignacion.user.areaId;
    if (!empleadoAreaId) continue;

    const jefe = await prisma.user.findFirst({
      where: {
        areaId: empleadoAreaId,
        puesto: { nombre: { startsWith: "Jefe" } },
      },
      select: { id: true },
    });

    if (!jefe) continue;

    const key = `${jefe.id}-${diasPendiente}`;
    if (notificadosPorJefeYDia.has(key)) continue;
    notificadosPorJefeYDia.set(key, diasPendiente);

    const totalPendientesJefe = pendientes.filter(
      (p) => p.asignacion.user.areaId === empleadoAreaId
    ).length;

    const mensajes: Record<number, string> = {
      3: `Tienes ${totalPendientesJefe} KPI(s) de tu equipo esperando validacion (hace 3 dias)`,
      5: `${totalPendientesJefe} KPI(s) de tu equipo pendientes hace 5 dias`,
      7: `${totalPendientesJefe} KPI(s) pendientes hace 1 semana. Tu equipo espera tu validacion.`,
    };

    await prisma.notificacion.create({
      data: {
        userId: jefe.id,
        tipo: "RECORDATORIO",
        titulo: "KPIs pendientes de validacion",
        mensaje: mensajes[diasPendiente],
        url: "/mi-equipo/kpis",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    notificaciones: notificadosPorJefeYDia.size,
  });
}
