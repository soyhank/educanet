/**
 * Prompt 20 — Seed del catálogo de tareas: Diseñador Gráfico (Hector).
 *
 * Idempotente: upsert por `codigo`. Borra y recrea checklistItems.
 *
 * Pre-requisito: db:seed-piloto (para que exista el puesto "Disenador Grafico")
 * Pre-requisito: db:push (para que existan los nuevos valores de enum)
 *
 * Uso:
 *   npm run db:seed-catalogo-diseno
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATALOGO_TAREAS_DISENADOR } from "../lib/tareas/catalogo-disenador-seed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function resolverPuestoId(nombrePuesto: string): Promise<string> {
  const puesto = await prisma.puesto.findFirst({
    where: { nombre: nombrePuesto },
  });
  if (!puesto) {
    throw new Error(
      `Puesto "${nombrePuesto}" no encontrado. Corre db:seed-piloto primero.`
    );
  }
  return puesto.id;
}

async function main() {
  console.log("Seed Prompt 20 — Catálogo Diseñador Gráfico\n");

  let creadas = 0;
  let actualizadas = 0;

  for (let i = 0; i < CATALOGO_TAREAS_DISENADOR.length; i++) {
    const t = CATALOGO_TAREAS_DISENADOR[i];
    const rolResponsableId = await resolverPuestoId(t.rolPuesto);

    const existente = await prisma.catalogoTarea.findUnique({
      where: { codigo: t.codigo },
    });

    const data = {
      codigo: t.codigo,
      nombre: t.nombre,
      descripcion: t.descripcion,
      categoria: t.categoria,
      rolResponsableId,
      tiempoMinimoMin: t.tiempoMinimoMin,
      tiempoMaximoMin: t.tiempoMaximoMin,
      tipoTrabajo: t.tipoTrabajo,
      puntosBase: t.puntosBase,
      bonusATiempo: t.bonusATiempo ?? 2,
      bonusDesbloqueo: t.bonusDesbloqueo ?? 3,
      permiteVariabilidad: t.permiteVariabilidad ?? false,
      orden: 200 + i,
      activa: true,
    };

    const tarea = existente
      ? await prisma.catalogoTarea.update({ where: { id: existente.id }, data })
      : await prisma.catalogoTarea.create({ data });

    // Refrescar checklist
    await prisma.checklistItemPlantilla.deleteMany({
      where: { catalogoTareaId: tarea.id },
    });

    if (t.checklist.length > 0) {
      await prisma.checklistItemPlantilla.createMany({
        data: t.checklist.map((descripcion, idx) => ({
          catalogoTareaId: tarea.id,
          orden: idx,
          descripcion,
          obligatorio: true,
        })),
      });
    }

    if (existente) actualizadas++;
    else creadas++;
  }

  console.log(
    `  ${creadas} tareas creadas · ${actualizadas} actualizadas`
  );
  console.log(`\n✓ Catálogo Diseñador Gráfico sembrado correctamente`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
