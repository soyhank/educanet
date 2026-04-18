import { prisma } from "@/lib/prisma";
import type { TipoEventoGamificacion } from "@prisma/client";
import { getSemanaISO } from "@/lib/gamificacion/periodo";
import { actualizarProgresoMision } from "./actions";

/**
 * Hook llamado por el motor tras procesar un evento. Actualiza el
 * progreso de misiones activas del usuario segun el tipo de evento.
 * No debe bloquear el flujo principal: si falla, se logea y sigue.
 */
export async function verificarMisionesTrasEvento(params: {
  userId: string;
  tipoEvento: TipoEventoGamificacion;
  referenciaId?: string;
}) {
  const { semana, anio } = getSemanaISO(new Date());

  const misiones = await prisma.mision.findMany({
    where: {
      userId: params.userId,
      estado: "ACTIVA",
      semanaDelAnio: semana,
      anio,
    },
  });

  for (const m of misiones) {
    if (
      m.tipo === "COMPLETAR_N_LECCIONES" &&
      params.tipoEvento === "LECCION_COMPLETADA"
    ) {
      await actualizarProgresoMision(m.id, 1);
    } else if (
      m.tipo === "COMPLETAR_CURSO" &&
      params.tipoEvento === "CURSO_COMPLETADO" &&
      params.referenciaId === m.cursoId
    ) {
      await actualizarProgresoMision(m.id, 1);
    } else if (
      m.tipo === "OBTENER_BADGE" &&
      params.tipoEvento === "BADGE_OBTENIDO"
    ) {
      await actualizarProgresoMision(m.id, 1);
    } else if (
      m.tipo === "RECONOCER_PEER" &&
      params.tipoEvento === "RECONOCIMIENTO_RECIBIDO"
    ) {
      // El hook se llama desde crearReconocimiento con nominadorId
      await actualizarProgresoMision(m.id, 1);
    }
  }
}
