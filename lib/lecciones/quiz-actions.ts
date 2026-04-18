"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { otorgarPuntos } from "@/lib/gamificacion/puntos";
import { verificarBadges } from "@/lib/gamificacion/badges";
import { registrarActividad } from "@/lib/gamificacion/rachas";
import { revalidatePath } from "next/cache";

type RespuestaInput = { preguntaId: string; opcionIds: string[] };

type ResultadoPregunta = {
  preguntaId: string;
  correcta: boolean;
  opcionesCorrectas: string[];
  opcionesSeleccionadas: string[];
  explicacion: string | null;
};

export async function procesarIntentoQuiz(
  quizId: string,
  respuestas: RespuestaInput[]
) {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      preguntas: {
        include: { opciones: true },
      },
      leccion: {
        select: {
          id: true,
          puntosRecompensa: true,
          modulo: { select: { curso: { select: { slug: true } } } },
        },
      },
    },
  });

  if (!quiz) return { error: "Quiz no encontrado" };

  // Score: proportional for MULTIPLE, binary for UNICA
  let totalPuntos = 0;
  let puntosObtenidos = 0;
  const resultados: ResultadoPregunta[] = [];

  for (const pregunta of quiz.preguntas) {
    totalPuntos++;
    const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id);
    const opcionesCorrectas = pregunta.opciones
      .filter((o) => o.esCorrecta)
      .map((o) => o.id);
    const seleccionadas = respuesta?.opcionIds ?? [];

    let correcta = false;

    if (pregunta.tipo === "UNICA") {
      correcta =
        seleccionadas.length === 1 && opcionesCorrectas.includes(seleccionadas[0]);
      if (correcta) puntosObtenidos++;
    } else {
      // MULTIPLE: proportional scoring
      const aciertos = seleccionadas.filter((id) =>
        opcionesCorrectas.includes(id)
      ).length;
      const errores = seleccionadas.filter(
        (id) => !opcionesCorrectas.includes(id)
      ).length;
      const score = Math.max(
        0,
        (aciertos - errores) / opcionesCorrectas.length
      );
      puntosObtenidos += score;
      correcta = score === 1;
    }

    resultados.push({
      preguntaId: pregunta.id,
      correcta,
      opcionesCorrectas,
      opcionesSeleccionadas: seleccionadas,
      explicacion: pregunta.explicacion,
    });
  }

  const puntaje = Math.round((puntosObtenidos / totalPuntos) * 100);
  const aprobado = puntaje >= quiz.puntajeMinimo;

  // Save attempt
  await prisma.intentoQuiz.create({
    data: {
      userId: user.id,
      quizId,
      puntaje,
      aprobado,
      respuestas: JSON.parse(JSON.stringify(respuestas)),
    },
  });

  let puntosGanados = 0;
  let subioDeNivel = false;
  let nuevoNivel: number | undefined;

  if (aprobado) {
    // Check if first approved attempt
    const intentosPrevios = await prisma.intentoQuiz.count({
      where: { userId: user.id, quizId, aprobado: true },
    });

    if (intentosPrevios <= 1) {
      // First pass — award points and mark lesson
      const res = await otorgarPuntos({
        userId: user.id,
        cantidad: quiz.leccion.puntosRecompensa,
        razon: "APROBAR_QUIZ",
        descripcion: `Quiz aprobado: ${quiz.titulo}`,
        referenciaId: quiz.leccion.id,
      });
      puntosGanados = quiz.leccion.puntosRecompensa;
      subioDeNivel = res.subioDeNivel;
      nuevoNivel = res.nuevoNivel ?? undefined;

      // Mark lesson completed
      await prisma.progresoLeccion.upsert({
        where: {
          userId_leccionId: { userId: user.id, leccionId: quiz.leccion.id },
        },
        update: { completada: true, porcentajeVisto: 100, fechaCompletada: new Date() },
        create: {
          userId: user.id,
          leccionId: quiz.leccion.id,
          completada: true,
          porcentajeVisto: 100,
          fechaCompletada: new Date(),
        },
      });
    }

  }

  // Register activity and check badges
  if (aprobado) {
    await registrarActividad(user.id);
  }
  const badgesDesbloqueados = aprobado ? await verificarBadges(user.id) : [];

  const cursoSlug = quiz.leccion.modulo.curso.slug;
  revalidatePath(`/cursos/${cursoSlug}`);
  revalidatePath("/logros");

  return {
    puntaje,
    aprobado,
    puntajeMinimo: quiz.puntajeMinimo,
    puntosGanados,
    subioDeNivel,
    nuevoNivel,
    resultados,
    badgesDesbloqueados,
  };
}
