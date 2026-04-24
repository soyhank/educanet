/**
 * Seed del catálogo de tareas operativas (Prompt 18).
 *
 * Idempotente: upsert por `codigo`. Borra y recrea checklistItems.
 *
 * Uso:
 *   npm run db:seed-catalogo
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  CATALOGO_TAREAS_SEED,
  DEPENDENCIAS_SEED,
  WORKFLOW_WEBINAR_COMPLETO,
} from "../lib/tareas/catalogo-seed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Los nombres del spec ("Asistente de Eventos", "Trafficker") vs los del
// seed real del piloto ("Asistente de Eventos", "Trafficker / SEO / SEM").
// Aquí se mapean para resolver el puesto exacto.
const PUESTO_ALIASES: Record<string, string[]> = {
  "Asistente de Eventos": ["Asistente de Eventos", "Asistente de Planificacion"],
  Trafficker: ["Trafficker / SEO / SEM", "Trafficker"],
  "Content Manager": ["Content Manager"],
  "Disenador Grafico": ["Disenador Grafico"],
  "Jefe de Marketing": ["Jefe de Marketing"],
};

async function resolverPuestoId(rolPuesto: string): Promise<string> {
  const alias = PUESTO_ALIASES[rolPuesto] ?? [rolPuesto];
  for (const nombre of alias) {
    const p = await prisma.puesto.findFirst({ where: { nombre } });
    if (p) return p.id;
  }
  throw new Error(
    `No se encontró ningún puesto con nombre en: ${alias.join(", ")}. Corre primero el seed del piloto (db:seed-piloto).`,
  );
}

async function sembrarCatalogo() {
  console.log(`Sembrando ${CATALOGO_TAREAS_SEED.length} tareas del catálogo…`);

  let creadas = 0;
  let actualizadas = 0;

  for (let i = 0; i < CATALOGO_TAREAS_SEED.length; i++) {
    const t = CATALOGO_TAREAS_SEED[i];
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
      orden: i,
      activa: true,
    };

    const tarea = existente
      ? await prisma.catalogoTarea.update({ where: { id: existente.id }, data })
      : await prisma.catalogoTarea.create({ data });

    // Refrescar checklist: borrar los antiguos y recrear (simple + idempotente)
    await prisma.checklistItemPlantilla.deleteMany({
      where: { catalogoTareaId: tarea.id },
    });

    if (t.checklist.length > 0) {
      await prisma.checklistItemPlantilla.createMany({
        data: t.checklist.map((item, idx) => ({
          catalogoTareaId: tarea.id,
          orden: idx,
          descripcion: item.descripcion,
          ayudaContextual: item.ayuda ?? null,
          obligatorio: item.obligatorio ?? true,
        })),
      });
    }

    if (existente) actualizadas++;
    else creadas++;
  }

  console.log(`  ${creadas} creadas · ${actualizadas} actualizadas`);
}

async function sembrarDependencias() {
  console.log(`Sembrando ${DEPENDENCIAS_SEED.length} dependencias…`);

  const porCodigo = new Map<string, string>();
  const todas = await prisma.catalogoTarea.findMany({
    select: { id: true, codigo: true },
  });
  for (const t of todas) porCodigo.set(t.codigo, t.id);

  let creadas = 0;
  for (const dep of DEPENDENCIAS_SEED) {
    const origenId = porCodigo.get(dep.origen);
    const destinoId = porCodigo.get(dep.destino);
    if (!origenId || !destinoId) {
      console.warn(`  Dependencia omitida: ${dep.origen} -> ${dep.destino} (tarea faltante)`);
      continue;
    }

    await prisma.dependenciaTarea.upsert({
      where: {
        tareaOrigenId_tareaDestinoId: {
          tareaOrigenId: origenId,
          tareaDestinoId: destinoId,
        },
      },
      create: {
        tareaOrigenId: origenId,
        tareaDestinoId: destinoId,
        tipoDependencia: dep.tipo,
      },
      update: { tipoDependencia: dep.tipo },
    });
    creadas++;
  }
  console.log(`  ${creadas} dependencias aplicadas`);
}

async function sembrarWorkflowPlantilla() {
  console.log(`Sembrando plantilla workflow "${WORKFLOW_WEBINAR_COMPLETO.codigo}"…`);

  const plantilla = await prisma.workflowPlantilla.upsert({
    where: { codigo: WORKFLOW_WEBINAR_COMPLETO.codigo },
    create: {
      codigo: WORKFLOW_WEBINAR_COMPLETO.codigo,
      nombre: WORKFLOW_WEBINAR_COMPLETO.nombre,
      descripcion: WORKFLOW_WEBINAR_COMPLETO.descripcion,
      categoria: WORKFLOW_WEBINAR_COMPLETO.categoria,
      duracionTotalDias: WORKFLOW_WEBINAR_COMPLETO.duracionTotalDias,
    },
    update: {
      nombre: WORKFLOW_WEBINAR_COMPLETO.nombre,
      descripcion: WORKFLOW_WEBINAR_COMPLETO.descripcion,
      duracionTotalDias: WORKFLOW_WEBINAR_COMPLETO.duracionTotalDias,
    },
  });

  // Refrescar tareas del workflow
  await prisma.tareaEnWorkflow.deleteMany({
    where: { workflowId: plantilla.id },
  });

  let inseridas = 0;
  for (const t of WORKFLOW_WEBINAR_COMPLETO.tareas) {
    const cat = await prisma.catalogoTarea.findUnique({
      where: { codigo: t.codigo },
    });
    if (!cat) {
      console.warn(`  Tarea ${t.codigo} faltante en catálogo; omitiendo en workflow`);
      continue;
    }
    await prisma.tareaEnWorkflow.create({
      data: {
        workflowId: plantilla.id,
        catalogoTareaId: cat.id,
        ordenEjecucion: t.orden,
        diasAntesDelHito: t.diasAntes,
      },
    });
    inseridas++;
  }

  console.log(`  Plantilla creada con ${inseridas} tareas`);
}

async function main() {
  console.log("Seed Prompt 18 — Catálogo de tareas operativas\n");
  await sembrarCatalogo();
  await sembrarDependencias();
  await sembrarWorkflowPlantilla();
  console.log("\n✓ Catálogo sembrado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
