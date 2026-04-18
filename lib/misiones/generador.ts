import { prisma } from "@/lib/prisma";
import type { TipoMision } from "@prisma/client";
import { calcularCumplimientoKpis } from "@/lib/kpis/calculo";
import { getSemanaISO, getAnio, mesActual } from "@/lib/gamificacion/periodo";

type PlantillaMision = {
  titulo: string;
  descripcion: string;
  tipo: TipoMision;
  puntos: number;
  metaValor?: number;
  cursoId?: string;
  kpiDefinicionId?: string;
};

async function plantillaKpi(userId: string): Promise<PlantillaMision> {
  const { mes, anio } = mesActual();
  const cumpl = await calcularCumplimientoKpis({ userId, mes, anio });

  const masBajo = [...cumpl.cumplimientos].sort(
    (a, b) => a.cumplimiento - b.cumplimiento
  )[0];

  if (masBajo && masBajo.cumplimiento < 80) {
    return {
      titulo: `Avanza en "${masBajo.nombre}"`,
      descripcion:
        `Reporta un valor esta semana y mejora tu cumplimiento en ${masBajo.nombre} ` +
        `(actual ${Math.round(masBajo.cumplimiento)}%).`,
      tipo: "AVANZAR_KPI",
      puntos: 40,
      metaValor: 1,
      kpiDefinicionId: masBajo.definicionId,
    };
  }

  return {
    titulo: "Reporta todos tus KPIs",
    descripcion:
      "Reporta el valor de la semana en cada uno de tus KPIs para mantener tu cumplimiento al dia.",
    tipo: "REPORTAR_KPI",
    puntos: 30,
    metaValor: Math.max(1, cumpl.cumplimientos.length),
  };
}

async function plantillaCurso(userId: string): Promise<PlantillaMision> {
  // Buscar curso en progreso
  const enProgreso = await prisma.progresoLeccion.findFirst({
    where: { userId, completada: false, porcentajeVisto: { gt: 0 } },
    orderBy: { fechaUltimaVista: "desc" },
    include: {
      leccion: {
        include: {
          modulo: { include: { curso: { select: { id: true, titulo: true } } } },
        },
      },
    },
  });

  if (enProgreso) {
    return {
      titulo: `Avanza en "${enProgreso.leccion.modulo.curso.titulo}"`,
      descripcion:
        "Completa 2 lecciones en este curso que ya iniciaste. Sigues de racha.",
      tipo: "COMPLETAR_N_LECCIONES",
      puntos: 40,
      metaValor: 2,
      cursoId: enProgreso.leccion.modulo.curso.id,
    };
  }

  // Sin curso en progreso: empezar uno del area o generico
  return {
    titulo: "Completa 2 lecciones",
    descripcion:
      "Completa 2 lecciones de cualquier curso disponible esta semana.",
    tipo: "COMPLETAR_N_LECCIONES",
    puntos: 40,
    metaValor: 2,
  };
}

async function plantillaSocial(userId: string): Promise<PlantillaMision> {
  const { semana, anio } = getSemanaISO(new Date());

  const yaReconocio = await prisma.reconocimiento.findFirst({
    where: { nominadorId: userId, semanaDelAnio: semana, anio },
    select: { id: true },
  });

  if (!yaReconocio) {
    return {
      titulo: "Reconoce a un compañero",
      descripcion:
        "Nomina a alguien de tu equipo por un trabajo que admires esta semana. Un mensaje especifico motiva mas.",
      tipo: "RECONOCER_PEER",
      puntos: 30,
      metaValor: 1,
    };
  }

  return {
    titulo: "Deja un comentario util en un curso",
    descripcion:
      "Comparte una idea, duda o aplicacion real en algun curso para ayudar a tus compañeros.",
    tipo: "PERSONALIZADA",
    puntos: 20,
    metaValor: 1,
  };
}

export async function generarMisionesSemanalesUsuario(params: {
  userId: string;
  semanaDelAnio?: number;
  anio?: number;
}) {
  const ahora = new Date();
  const semana = params.semanaDelAnio ?? getSemanaISO(ahora).semana;
  const anio = params.anio ?? getAnio(ahora);

  const existentes = await prisma.mision.count({
    where: { userId: params.userId, semanaDelAnio: semana, anio },
  });
  if (existentes > 0) return { generadas: 0, omitidas: true };

  const plantillas = await Promise.all([
    plantillaKpi(params.userId),
    plantillaCurso(params.userId),
    plantillaSocial(params.userId),
  ]);

  const creadas = await prisma.$transaction(
    plantillas.map((p) =>
      prisma.mision.create({
        data: {
          userId: params.userId,
          titulo: p.titulo,
          descripcion: p.descripcion,
          tipo: p.tipo,
          semanaDelAnio: semana,
          anio,
          puntosRecompensa: p.puntos,
          metaValor: p.metaValor ?? null,
          cursoId: p.cursoId ?? null,
          kpiDefinicionId: p.kpiDefinicionId ?? null,
        },
      })
    )
  );

  return { generadas: creadas.length, omitidas: false };
}

export async function regenerarMisionesSiNoExisten(userId: string) {
  return generarMisionesSemanalesUsuario({ userId });
}

export async function generarMisionesEquipo(areaId: string) {
  const users = await prisma.user.findMany({
    where: { areaId, activo: true },
    select: { id: true },
  });
  let totalGeneradas = 0;
  for (const u of users) {
    const r = await generarMisionesSemanalesUsuario({ userId: u.id });
    totalGeneradas += r.generadas;
  }
  return { totalGeneradas, usuarios: users.length };
}

export async function vencerMisionesVencidas() {
  const { semana, anio } = getSemanaISO(new Date());
  const res = await prisma.mision.updateMany({
    where: {
      estado: "ACTIVA",
      OR: [
        { anio: { lt: anio } },
        { anio, semanaDelAnio: { lt: semana } },
      ],
    },
    data: { estado: "VENCIDA" },
  });
  return { vencidas: res.count };
}
