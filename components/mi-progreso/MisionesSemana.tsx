import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSemanaISO, getAnio } from "@/lib/gamificacion/periodo";
import { MisionCard } from "@/components/misiones/MisionCard";
import { regenerarMisionesSiNoExisten } from "@/lib/misiones/generador";

export async function MisionesSemana({ userId }: { userId: string }) {
  const { semana, anio } = getSemanaISO(new Date());

  // Auto-generar si no existen para esta semana
  await regenerarMisionesSiNoExisten(userId);

  const misiones = await prisma.mision.findMany({
    where: {
      userId,
      semanaDelAnio: semana,
      anio,
      estado: { in: ["ACTIVA", "COMPLETADA"] },
    },
    include: { curso: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (misiones.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">
          Misiones de la semana{" "}
          <span className="text-xs font-normal text-muted-foreground">
            · Semana {semana}/{anio}
          </span>
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {misiones.map((m) => (
          <MisionCard
            key={m.id}
            id={m.id}
            titulo={m.titulo}
            descripcion={m.descripcion}
            tipo={m.tipo}
            estado={m.estado}
            puntosRecompensa={m.puntosRecompensa}
            metaValor={m.metaValor}
            progresoActual={m.progresoActual}
            cursoSlug={m.curso?.slug}
          />
        ))}
      </div>
    </section>
  );
}
