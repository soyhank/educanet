import { prisma } from "@/lib/prisma";
import { startOfDay, differenceInDays } from "date-fns";
import { verificarBadges, type BadgeDesbloqueado } from "./badges";

export type ResultadoRacha = {
  rachaAnterior: number;
  rachaActual: number;
  cambio: "incrementada" | "mantenida" | "reiniciada" | "primera";
  badgesDesbloqueados: BadgeDesbloqueado[];
};

export async function registrarActividad(userId: string): Promise<ResultadoRacha> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rachaActual: true, ultimaActividad: true },
  });

  if (!user) throw new Error("Usuario no existe");

  const ahora = new Date();
  const hoy = startOfDay(ahora);
  const ultima = user.ultimaActividad ? startOfDay(new Date(user.ultimaActividad)) : null;

  let nuevaRacha: number;
  let cambio: ResultadoRacha["cambio"];

  if (!ultima) {
    nuevaRacha = 1;
    cambio = "primera";
  } else {
    const diffDias = differenceInDays(hoy, ultima);
    if (diffDias === 0) {
      nuevaRacha = user.rachaActual;
      cambio = "mantenida";
    } else if (diffDias === 1) {
      nuevaRacha = user.rachaActual + 1;
      cambio = "incrementada";
    } else {
      nuevaRacha = 1;
      cambio = "reiniciada";
      // TODO: If user has freezeDisponibles > 0, consume 1 and maintain streak
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { rachaActual: nuevaRacha, ultimaActividad: ahora },
  });

  let badgesDesbloqueados: BadgeDesbloqueado[] = [];
  if (cambio === "incrementada" || cambio === "primera") {
    badgesDesbloqueados = await verificarBadges(userId);
  }

  return {
    rachaAnterior: user.rachaActual,
    rachaActual: nuevaRacha,
    cambio,
    badgesDesbloqueados,
  };
}
