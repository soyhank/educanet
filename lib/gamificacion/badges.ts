import { prisma } from "@/lib/prisma";
import { otorgarPuntos } from "./puntos";
import type { Badge, CriterioBadge } from "@prisma/client";

export type BadgeDesbloqueado = {
  badge: { id: string; codigo: string; nombre: string; descripcion: string; iconoUrl: string };
  puntosGanados: number;
};

type Stats = {
  cursosCompletados: number;
  leccionesCompletadas: number;
  puntosTotales: number;
  rachaActual: number;
  subioANivel: number;
  completoInduccion: boolean;
  tieneQuizPerfecto: boolean;
};

async function obtenerStatsUsuario(userId: string): Promise<Stats> {
  const [user, leccionesCompletadas, intentosPerfectos, certInduccion, certificados] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { puntosTotales: true, rachaActual: true, nivel: true },
      }),
      prisma.progresoLeccion.count({ where: { userId, completada: true } }),
      prisma.intentoQuiz.count({ where: { userId, puntaje: 100 } }),
      prisma.certificado.findFirst({
        where: { userId, curso: { slug: "induccion-empresa" } },
      }),
      prisma.certificado.count({ where: { userId } }),
    ]);

  return {
    cursosCompletados: certificados,
    leccionesCompletadas,
    puntosTotales: user?.puntosTotales ?? 0,
    rachaActual: user?.rachaActual ?? 0,
    subioANivel: user?.nivel ?? 1,
    completoInduccion: certInduccion !== null,
    tieneQuizPerfecto: intentosPerfectos > 0,
  };
}

type Evaluador = (badge: Badge, stats: Stats) => boolean;

const evaluadores: Record<CriterioBadge, Evaluador> = {
  COMPLETAR_N_CURSOS: (badge, stats) => {
    const n = (badge.criterioValor as { n?: number })?.n ?? 1;
    return stats.cursosCompletados >= n;
  },
  COMPLETAR_N_LECCIONES: (badge, stats) => {
    const n = (badge.criterioValor as { n?: number })?.n ?? 1;
    return stats.leccionesCompletadas >= n;
  },
  RACHA_DIAS: (badge, stats) => {
    const n = (badge.criterioValor as { n?: number })?.n ?? 1;
    return stats.rachaActual >= n;
  },
  PUNTOS_ACUMULADOS: (badge, stats) => {
    const n = (badge.criterioValor as { n?: number })?.n ?? 1;
    return stats.puntosTotales >= n;
  },
  COMPLETAR_RUTA: () => {
    // TODO: implement when route completion tracking exists
    return false;
  },
  PRIMER_QUIZ_PERFECTO: (_badge, stats) => stats.tieneQuizPerfecto,
  COMPLETAR_INDUCCION: (_badge, stats) => stats.completoInduccion,
  SUBIR_A_NIVEL: (badge, stats) => {
    const n = (badge.criterioValor as { n?: number })?.n ?? 1;
    return stats.subioANivel >= n;
  },
};

export async function verificarBadges(userId: string): Promise<BadgeDesbloqueado[]> {
  const stats = await obtenerStatsUsuario(userId);

  const badgesPendientes = await prisma.badge.findMany({
    where: { NOT: { usuarios: { some: { userId } } } },
  });

  const desbloqueados: BadgeDesbloqueado[] = [];

  for (const badge of badgesPendientes) {
    const evaluador = evaluadores[badge.criterioTipo];
    if (!evaluador) continue;

    if (evaluador(badge, stats)) {
      const result = await otorgarBadge(userId, badge);
      desbloqueados.push(result);
      // Update stats after awarding points
      stats.puntosTotales += badge.puntosRecompensa;
    }
  }

  return desbloqueados;
}

async function otorgarBadge(userId: string, badge: Badge): Promise<BadgeDesbloqueado> {
  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  await otorgarPuntos({
    userId,
    cantidad: badge.puntosRecompensa,
    razon: "COMPLETAR_LECCION", // closest available reason
    descripcion: `Badge desbloqueado: ${badge.nombre}`,
    referenciaId: badge.id,
  });

  await prisma.notificacion.create({
    data: {
      userId,
      tipo: "LOGRO",
      titulo: `Nuevo logro: ${badge.nombre}!`,
      mensaje: badge.descripcion,
      url: "/logros",
    },
  });

  return {
    badge: {
      id: badge.id,
      codigo: badge.codigo,
      nombre: badge.nombre,
      descripcion: badge.descripcion,
      iconoUrl: badge.iconoUrl,
    },
    puntosGanados: badge.puntosRecompensa,
  };
}
