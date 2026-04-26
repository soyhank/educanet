import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import type { NivelCurso } from "@prisma/client";
import type {
  CursoListado,
  CursoDetalleCompleto,
  EstadoCurso,
  ModuloConProgreso,
  RecursoDetalle,
} from "@/types/cursos";

type ListarCursosParams = {
  userId: string;
  areaId?: string;
  nivel?: NivelCurso;
  estado?: EstadoCurso;
  busqueda?: string;
  orden?: "recientes" | "populares" | "alfabetico" | "duracion";
  soloMios?: boolean;
};

export async function listarCursos(
  params: ListarCursosParams
): Promise<CursoListado[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cursos", `cursos-usuario-${params.userId}`);

  const cursos = await prisma.curso.findMany({
    where: {
      publicado: true,
      ...(params.areaId && { areaId: params.areaId }),
      ...(params.nivel && { nivel: params.nivel }),
      ...(params.busqueda && {
        OR: [
          { titulo: { contains: params.busqueda, mode: "insensitive" } },
          { descripcion: { contains: params.busqueda, mode: "insensitive" } },
          {
            instructorNombre: {
              contains: params.busqueda,
              mode: "insensitive",
            },
          },
        ],
      }),
    },
    include: {
      area: true,
      modulos: {
        include: {
          lecciones: {
            select: {
              id: true,
              progresos: {
                where: { userId: params.userId },
                select: { completada: true },
              },
            },
          },
        },
      },
    },
    orderBy: params.orden === "alfabetico"
      ? { titulo: "asc" }
      : params.orden === "duracion"
        ? { duracionMinutos: "asc" }
        : { orden: "asc" },
  });

  const result: CursoListado[] = cursos.map((curso) => {
    const totalLecciones = curso.modulos.reduce(
      (acc, m) => acc + m.lecciones.length,
      0
    );
    const leccionesCompletadas = curso.modulos.reduce(
      (acc, m) =>
        acc +
        m.lecciones.filter((l) => l.progresos[0]?.completada === true).length,
      0
    );
    const porcentaje =
      totalLecciones > 0
        ? Math.round((leccionesCompletadas / totalLecciones) * 100)
        : 0;
    const estado: EstadoCurso =
      porcentaje === 100
        ? "completado"
        : porcentaje > 0
          ? "en-progreso"
          : "no-iniciado";

    return {
      id: curso.id,
      slug: curso.slug,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      descripcionCorta: curso.descripcionCorta,
      thumbnailUrl: curso.thumbnailUrl,
      duracionMinutos: curso.duracionMinutos,
      nivel: curso.nivel,
      puntosRecompensa: curso.puntosRecompensa,
      instructorNombre: curso.instructorNombre,
      instructorAvatarUrl: curso.instructorAvatarUrl,
      orden: curso.orden,
      area: curso.area,
      totalLecciones,
      leccionesCompletadas,
      porcentaje,
      estado,
    };
  });

  // Filter by estado post-query (calculated field)
  let filtered = result;
  if (params.estado) {
    filtered = filtered.filter((c) => c.estado === params.estado);
  }
  if (params.soloMios) {
    filtered = filtered.filter((c) => c.estado !== "no-iniciado");
  }

  return filtered;
}

export async function obtenerCursoDetalle(
  slug: string,
  userId: string
): Promise<CursoDetalleCompleto | null> {
  const curso = await prisma.curso.findUnique({
    where: { slug },
    include: {
      area: true,
      modulos: {
        orderBy: { orden: "asc" },
        include: {
          lecciones: {
            orderBy: { orden: "asc" },
            include: {
              quiz: { select: { id: true } },
              recursos: { orderBy: { orden: "asc" } },
              progresos: {
                where: { userId },
                select: { completada: true, porcentajeVisto: true },
              },
            },
          },
        },
      },
    },
  });

  if (!curso) return null;

  let ultimaLeccionSlug: string | null = null;
  let totalLecciones = 0;
  let leccionesCompletadas = 0;

  const recursos: RecursoDetalle[] = [];

  const modulos: ModuloConProgreso[] = curso.modulos.map((modulo) => {
    const lecciones = modulo.lecciones.map((leccion) => {
      totalLecciones++;
      const progreso = leccion.progresos[0];
      const completada = progreso?.completada ?? false;
      if (completada) leccionesCompletadas++;

      // Track last active lesson
      if (!completada && !ultimaLeccionSlug) {
        ultimaLeccionSlug = leccion.slug;
      }

      // Collect resources
      leccion.recursos.forEach((r) => {
        recursos.push({
          id: r.id,
          nombre: r.nombre,
          url: r.url,
          tipo: r.tipo,
          orden: r.orden,
          moduloTitulo: modulo.titulo,
        });
      });

      return {
        id: leccion.id,
        slug: leccion.slug,
        titulo: leccion.titulo,
        descripcion: leccion.descripcion,
        tipo: leccion.tipo,
        duracionSegundos: leccion.duracionSegundos,
        orden: leccion.orden,
        puntosRecompensa: leccion.puntosRecompensa,
        bunnyVideoId: leccion.bunnyVideoId,
        contenidoMarkdown: leccion.contenidoMarkdown,
        completada,
        porcentajeVisto: progreso?.porcentajeVisto ?? 0,
        tieneQuiz: leccion.quiz !== null,
      };
    });

    const modLeccionesCompletadas = lecciones.filter(
      (l) => l.completada
    ).length;

    return {
      id: modulo.id,
      titulo: modulo.titulo,
      descripcion: modulo.descripcion,
      orden: modulo.orden,
      lecciones,
      completado: modLeccionesCompletadas === lecciones.length,
      totalLecciones: lecciones.length,
      leccionesCompletadas: modLeccionesCompletadas,
    };
  });

  const porcentaje =
    totalLecciones > 0
      ? Math.round((leccionesCompletadas / totalLecciones) * 100)
      : 0;

  const estado: EstadoCurso =
    porcentaje === 100
      ? "completado"
      : porcentaje > 0
        ? "en-progreso"
        : "no-iniciado";

  return {
    id: curso.id,
    slug: curso.slug,
    titulo: curso.titulo,
    descripcion: curso.descripcion,
    descripcionCorta: curso.descripcionCorta,
    thumbnailUrl: curso.thumbnailUrl,
    duracionMinutos: curso.duracionMinutos,
    nivel: curso.nivel,
    puntosRecompensa: curso.puntosRecompensa,
    instructorNombre: curso.instructorNombre,
    instructorAvatarUrl: curso.instructorAvatarUrl,
    area: curso.area,
    modulos,
    recursos,
    totalLecciones,
    leccionesCompletadas,
    porcentaje,
    estado,
    ultimaLeccionSlug,
  };
}

export async function obtenerCursosSimilares(
  cursoId: string,
  areaId: string | null,
  limite = 3
): Promise<CursoListado[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cursos-similares", `cursos-similares-${cursoId}`);

  const cursos = await prisma.curso.findMany({
    where: {
      publicado: true,
      id: { not: cursoId },
      ...(areaId ? { OR: [{ areaId }, { areaId: null }] } : {}),
    },
    include: { area: true, modulos: { include: { lecciones: { select: { id: true } } } } },
    take: limite,
    orderBy: { orden: "asc" },
  });

  return cursos.map((c) => {
    const totalLecciones = c.modulos.reduce(
      (acc, m) => acc + m.lecciones.length,
      0
    );
    return {
      id: c.id,
      slug: c.slug,
      titulo: c.titulo,
      descripcion: c.descripcion,
      descripcionCorta: c.descripcionCorta,
      thumbnailUrl: c.thumbnailUrl,
      duracionMinutos: c.duracionMinutos,
      nivel: c.nivel,
      puntosRecompensa: c.puntosRecompensa,
      instructorNombre: c.instructorNombre,
      instructorAvatarUrl: c.instructorAvatarUrl,
      orden: c.orden,
      area: c.area,
      totalLecciones,
      leccionesCompletadas: 0,
      porcentaje: 0,
      estado: "no-iniciado" as const,
    };
  });
}

export async function listarAreas() {
  "use cache";
  cacheLife("hours");
  cacheTag("areas");
  return prisma.area.findMany({ orderBy: { nombre: "asc" } });
}
