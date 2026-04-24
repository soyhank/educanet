/**
 * Seed de un workflow demo para el piloto Marketing (Prompt 18).
 *
 * Crea una instancia del workflow "WEBINAR_COMPLETO" con fecha hito a 14
 * días desde hoy, asignando las tareas a los usuarios del piloto según su
 * puesto. Útil para smoke test.
 *
 * Requisitos previos:
 *  - npm run db:seed-piloto (usuarios + puestos Marketing)
 *  - npm run db:seed-catalogo (catálogo de tareas + plantilla webinar)
 *
 * Uso:
 *  npm run db:seed-workflow-demo
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { crearWorkflowDesdeTemplate } from "../lib/tareas/workflow-generator";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed Prompt 18 — Workflow demo Webinar Autodesk\n");

  const plantilla = await prisma.workflowPlantilla.findUnique({
    where: { codigo: "WEBINAR_COMPLETO" },
  });
  if (!plantilla) {
    console.error("✗ Plantilla WEBINAR_COMPLETO no encontrada. Corré primero: npm run db:seed-catalogo");
    process.exit(1);
  }

  const jefeMarketing = await prisma.user.findFirst({
    where: {
      puesto: { nombre: "Jefe de Marketing" },
    },
  });
  if (!jefeMarketing) {
    console.error("✗ No se encontró usuario con puesto 'Jefe de Marketing'. Corré primero: npm run db:seed-piloto");
    process.exit(1);
  }

  const fechaHito = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Idempotente: si ya hay un workflow demo con este nombre, lo borramos y
  // recreamos (así las fechas relativas al día de hoy son frescas).
  const nombre = "Webinar Autodesk Demo (piloto)";
  await prisma.workflowInstancia.deleteMany({ where: { nombre } });

  const result = await crearWorkflowDesdeTemplate({
    plantillaId: plantilla.id,
    nombre,
    contextoMarca: "Autodesk",
    fechaHito,
    responsableGeneralId: jefeMarketing.id,
    areaId: jefeMarketing.areaId ?? undefined,
    notas: "Workflow demo auto-generado por seed-workflow-demo",
  });

  console.log(
    `✓ Workflow creado: ${result.tareasCreadas} tareas · fecha hito ${fechaHito.toLocaleDateString("es")}`,
  );
  if (result.tareasOmitidas.length > 0) {
    console.log("\nTareas omitidas (sin usuario con rol correspondiente):");
    for (const om of result.tareasOmitidas) {
      console.log(`  - ${om.codigo}: ${om.motivo}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
