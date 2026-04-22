import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function isoWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff =
    (target.getTime() - firstThursday.getTime()) / (1000 * 60 * 60 * 24);
  return 1 + Math.round((diff - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

/**
 * Idempotente: asegura KpiAsignacionMes del mes actual para todos los usuarios
 * activos con puesto que tenga hitos, y genera instancias semanales + mensuales
 * PENDIENTEs. Util para disparar manualmente el inicio del mes o tras agregar
 * nuevos usuarios.
 */
async function main() {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();
  const semana = isoWeek(ahora);

  console.log(`Generando instancias mes=${mes} anio=${anio} semana=${semana}\n`);

  const definiciones = await prisma.puestoKpiDefinicion.findMany({
    where: { activa: true, frecuencia: { not: null } },
    select: { id: true, puestoId: true },
  });
  const porPuesto = new Map<string, string[]>();
  for (const d of definiciones) {
    const list = porPuesto.get(d.puestoId) ?? [];
    list.push(d.id);
    porPuesto.set(d.puestoId, list);
  }
  const puestoIds = Array.from(porPuesto.keys());
  const usuarios = await prisma.user.findMany({
    where: { activo: true, puestoId: { in: puestoIds } },
    select: { id: true, puestoId: true, nombre: true },
  });
  console.log(
    `Puestos con hitos: ${puestoIds.length}, usuarios afectados: ${usuarios.length}`
  );

  let asignaciones = 0;
  for (const u of usuarios) {
    if (!u.puestoId) continue;
    const defs = porPuesto.get(u.puestoId) ?? [];
    for (const definicionId of defs) {
      const exist = await prisma.kpiAsignacionMes.findUnique({
        where: {
          definicionId_userId_periodoMes_periodoAnio: {
            definicionId,
            userId: u.id,
            periodoMes: mes,
            periodoAnio: anio,
          },
        },
        select: { id: true },
      });
      if (!exist) {
        await prisma.kpiAsignacionMes.create({
          data: { definicionId, userId: u.id, periodoMes: mes, periodoAnio: anio },
        });
        asignaciones++;
      }
    }
  }
  console.log(`Asignaciones nuevas: ${asignaciones}`);

  const semAsig = await prisma.kpiAsignacionMes.findMany({
    where: {
      periodoMes: mes,
      periodoAnio: anio,
      noAplica: false,
      definicion: { frecuencia: "SEMANAL", activa: true },
    },
    select: { id: true },
  });
  let sem = 0;
  for (const a of semAsig) {
    const e = await prisma.kpiInstancia.findFirst({
      where: { asignacionMesId: a.id, semanaDelAnio: semana, numeroOcurrencia: 1 },
      select: { id: true },
    });
    if (!e) {
      await prisma.kpiInstancia.create({
        data: {
          asignacionMesId: a.id,
          semanaDelAnio: semana,
          numeroOcurrencia: 1,
          estado: "PENDIENTE",
        },
      });
      sem++;
    }
  }
  console.log(`Instancias semanales nuevas: ${sem}`);

  const menAsig = await prisma.kpiAsignacionMes.findMany({
    where: {
      periodoMes: mes,
      periodoAnio: anio,
      noAplica: false,
      definicion: { frecuencia: "MENSUAL", activa: true },
    },
    include: { definicion: true },
  });
  let men = 0;
  for (const a of menAsig) {
    const cantidad = a.definicion.cantidadMaxMes
      ? a.cantidadMes ?? a.definicion.cantidadMaxMes
      : 1;
    for (let n = 1; n <= cantidad; n++) {
      const e = await prisma.kpiInstancia.findFirst({
        where: { asignacionMesId: a.id, semanaDelAnio: null, numeroOcurrencia: n },
        select: { id: true },
      });
      if (!e) {
        await prisma.kpiInstancia.create({
          data: {
            asignacionMesId: a.id,
            semanaDelAnio: null,
            numeroOcurrencia: n,
            estado: "PENDIENTE",
          },
        });
        men++;
      }
    }
  }
  console.log(`Instancias mensuales nuevas: ${men}`);
  console.log("\nListo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
