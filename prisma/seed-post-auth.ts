import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

/**
 * Script para completar datos de los usuarios despues de crearlos
 * en Supabase Auth. Los busca por email y les asigna puesto, area,
 * puntos, progreso, badges, metricas y notificaciones.
 *
 * Ejecutar: npm run db:seed-post-auth
 */
async function main() {
  console.log("Completando datos de usuarios post-auth...\n");

  const now = new Date();
  const hace8Meses = new Date(now.getFullYear(), now.getMonth() - 8, 15);
  const hace2Anios = new Date(now.getFullYear() - 2, now.getMonth(), 1);
  const hace3Meses = new Date(now.getFullYear(), now.getMonth() - 3, 10);

  // Buscar usuarios por email
  const admin = await prisma.user.findUnique({ where: { email: "admin@educanet.local" } });
  const jefeMkt = await prisma.user.findUnique({ where: { email: "jefe.marketing@educanet.local" } });
  const ana = await prisma.user.findUnique({ where: { email: "ana.garcia@educanet.local" } });
  const carlos = await prisma.user.findUnique({ where: { email: "carlos.lopez@educanet.local" } });
  const maria = await prisma.user.findUnique({ where: { email: "maria.torres@educanet.local" } });

  const users = { admin, jefeMkt, ana, carlos, maria };
  const missing = Object.entries(users).filter(([, u]) => !u).map(([k]) => k);
  if (missing.length > 0) {
    console.error(`  Usuarios no encontrados: ${missing.join(", ")}`);
    console.error("  Asegurate de haberlos creado en Supabase Auth primero.");
    console.error("  Ver instrucciones en supabase/auth-sync.sql");
    process.exit(1);
  }

  const marketing = await prisma.area.findFirst({ where: { nombre: "Marketing" } });
  const ventas = await prisma.area.findFirst({ where: { nombre: "Ventas" } });
  const operaciones = await prisma.area.findFirst({ where: { nombre: "Operaciones" } });

  if (!marketing || !ventas || !operaciones) {
    console.error("  Areas no encontradas. Ejecuta primero: npx prisma db seed");
    process.exit(1);
  }

  // ─── Actualizar perfiles ──────────────────────────────────────────────────
  await prisma.user.update({
    where: { id: admin!.id },
    data: { nombre: "Admin", apellido: "Educanet", rol: "ADMIN" },
  });

  await prisma.user.update({
    where: { id: jefeMkt!.id },
    data: { nombre: "Jefe", apellido: "Marketing", rol: "ADMIN", puestoId: "puesto-coordinador", areaId: marketing.id },
  });

  await prisma.user.update({
    where: { id: ana!.id },
    data: {
      nombre: "Ana", apellido: "Garcia", rol: "TRABAJADOR",
      puestoId: "puesto-analista-jr", areaId: marketing.id,
      fechaIngreso: hace8Meses, puntosTotales: 450, nivel: 3,
      rachaActual: 5, ultimaActividad: new Date(now.getTime() - 86400000),
    },
  });

  await prisma.user.update({
    where: { id: carlos!.id },
    data: {
      nombre: "Carlos", apellido: "Lopez", rol: "TRABAJADOR",
      puestoId: "puesto-ejecutivo", areaId: ventas.id,
      fechaIngreso: hace2Anios, puntosTotales: 1200, nivel: 6,
      rachaActual: 12, ultimaActividad: now,
    },
  });

  await prisma.user.update({
    where: { id: maria!.id },
    data: {
      nombre: "Maria", apellido: "Torres", rol: "TRABAJADOR",
      puestoId: "puesto-asistente", areaId: operaciones.id,
      fechaIngreso: hace3Meses, puntosTotales: 80, nivel: 1,
      rachaActual: 2, ultimaActividad: new Date(now.getTime() - 172800000),
    },
  });
  console.log("  Perfiles actualizados: 5");

  // ─── Progreso de lecciones ────────────────────────────────────────────────
  const allProgreso = [
    ...[1,2,3,4,5,6,7,8].map((i) => ({
      userId: ana!.id, leccionId: `lec-ind-${i}`, completada: true, porcentajeVisto: 100,
      fechaCompletada: new Date(hace8Meses.getTime() + 86400000 * Math.ceil(i/2 + 1)),
      fechaUltimaVista: new Date(hace8Meses.getTime() + 86400000 * Math.ceil(i/2 + 1)),
    })),
    { userId: ana!.id, leccionId: "lec-mkt-1", completada: true, porcentajeVisto: 100, fechaCompletada: new Date(now.getTime() - 86400000*10), fechaUltimaVista: new Date(now.getTime() - 86400000*10) },
    { userId: ana!.id, leccionId: "lec-mkt-2", completada: true, porcentajeVisto: 100, fechaCompletada: new Date(now.getTime() - 86400000*8), fechaUltimaVista: new Date(now.getTime() - 86400000*8) },
    { userId: ana!.id, leccionId: "lec-mkt-3", completada: true, porcentajeVisto: 100, fechaCompletada: new Date(now.getTime() - 86400000*7), fechaUltimaVista: new Date(now.getTime() - 86400000*7) },
    { userId: ana!.id, leccionId: "lec-mkt-4", completada: false, porcentajeVisto: 65, fechaCompletada: null, fechaUltimaVista: now },
    ...[1,2,3,4,5,6,7,8].map((i) => ({
      userId: carlos!.id, leccionId: `lec-ind-${i}`, completada: true, porcentajeVisto: 100,
      fechaCompletada: new Date(hace2Anios.getTime() + 86400000 * (i + 2)),
      fechaUltimaVista: new Date(hace2Anios.getTime() + 86400000 * (i + 2)),
    })),
    { userId: maria!.id, leccionId: "lec-ind-1", completada: true, porcentajeVisto: 100, fechaCompletada: new Date(hace3Meses.getTime() + 86400000), fechaUltimaVista: new Date(hace3Meses.getTime() + 86400000) },
    { userId: maria!.id, leccionId: "lec-ind-2", completada: false, porcentajeVisto: 40, fechaCompletada: null, fechaUltimaVista: now },
  ];

  for (const p of allProgreso) {
    await prisma.progresoLeccion.upsert({
      where: { userId_leccionId: { userId: p.userId, leccionId: p.leccionId } },
      update: {},
      create: p,
    });
  }
  console.log(`  Progreso: ${allProgreso.length} registros`);

  // ─── Transacciones de puntos ──────────────────────────────────────────────
  const cursoInduccion = await prisma.curso.findUnique({ where: { slug: "induccion-empresa" } });

  const transacciones = [
    { userId: ana!.id, cantidad: 150, razon: "COMPLETAR_CURSO" as const, descripcion: "Curso de induccion completado", referenciaId: cursoInduccion?.id, fecha: new Date(hace8Meses.getTime() + 86400000 * 6) },
    { userId: ana!.id, cantidad: 100, razon: "COMPLETAR_LECCION" as const, descripcion: "Lecciones de Marketing Digital modulo 1", fecha: new Date(now.getTime() - 86400000 * 7) },
    { userId: ana!.id, cantidad: 200, razon: "RACHA_DIAS" as const, descripcion: "Racha de 5 dias consecutivos", fecha: new Date(now.getTime() - 86400000 * 2) },
    { userId: carlos!.id, cantidad: 150, razon: "COMPLETAR_CURSO" as const, descripcion: "Curso de induccion completado", referenciaId: cursoInduccion?.id, fecha: new Date(hace2Anios.getTime() + 86400000 * 7) },
    { userId: carlos!.id, cantidad: 500, razon: "RACHA_DIAS" as const, descripcion: "Racha de 30 dias consecutivos", fecha: new Date(now.getTime() - 86400000 * 60) },
    { userId: carlos!.id, cantidad: 550, razon: "LOGRO_OBJETIVO" as const, descripcion: "Objetivo de ventas Q4 superado", fecha: new Date(now.getTime() - 86400000 * 30) },
    { userId: maria!.id, cantidad: 20, razon: "COMPLETAR_LECCION" as const, descripcion: "Primera leccion de induccion completada", fecha: new Date(hace3Meses.getTime() + 86400000) },
    { userId: maria!.id, cantidad: 60, razon: "RACHA_DIAS" as const, descripcion: "Racha de 2 dias", fecha: new Date(now.getTime() - 86400000) },
  ];

  for (const t of transacciones) {
    await prisma.transaccionPuntos.create({ data: t });
  }
  console.log(`  Transacciones: ${transacciones.length}`);

  // ─── Badges otorgados ─────────────────────────────────────────────────────
  const userBadges = [
    { userId: ana!.id, badgeId: "badge-primer-paso", fechaObtencion: new Date(hace8Meses.getTime() + 86400000 * 2) },
    { userId: ana!.id, badgeId: "badge-aprendiz", fechaObtencion: new Date(hace8Meses.getTime() + 86400000 * 6) },
    { userId: ana!.id, badgeId: "badge-induccion", fechaObtencion: new Date(hace8Meses.getTime() + 86400000 * 6) },
    { userId: carlos!.id, badgeId: "badge-primer-paso", fechaObtencion: new Date(hace2Anios.getTime() + 86400000 * 3) },
    { userId: carlos!.id, badgeId: "badge-aprendiz", fechaObtencion: new Date(hace2Anios.getTime() + 86400000 * 7) },
    { userId: carlos!.id, badgeId: "badge-induccion", fechaObtencion: new Date(hace2Anios.getTime() + 86400000 * 7) },
    { userId: carlos!.id, badgeId: "badge-constante", fechaObtencion: new Date(now.getTime() - 86400000 * 60) },
    { userId: carlos!.id, badgeId: "badge-mil-puntos", fechaObtencion: new Date(now.getTime() - 86400000 * 30) },
  ];

  for (const ub of userBadges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: ub.userId, badgeId: ub.badgeId } },
      update: {},
      create: ub,
    });
  }
  console.log(`  Badges otorgados: ${userBadges.length}`);

  // ─── Metricas ─────────────────────────────────────────────────────────────
  const inicioTrim = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const finTrim = new Date(inicioTrim.getFullYear(), inicioTrim.getMonth() + 3, 0);

  const metricas = [
    { userId: ana!.id, tipo: "marketing", nombre: "Campanas lanzadas", descripcion: "Numero de campanas digitales ejecutadas", valor: 3, objetivo: 5, unidad: "campanas", periodo: "TRIMESTRAL" as const, fechaInicio: inicioTrim, fechaFin: finTrim },
    { userId: carlos!.id, tipo: "ventas", nombre: "Cuota de ventas", descripcion: "Porcentaje de cumplimiento de la cuota", valor: 92, objetivo: 100, unidad: "%", periodo: "TRIMESTRAL" as const, fechaInicio: inicioTrim, fechaFin: finTrim },
    { userId: maria!.id, tipo: "operaciones", nombre: "Tickets resueltos", descripcion: "Tickets de soporte resueltos", valor: 45, objetivo: 60, unidad: "tickets", periodo: "TRIMESTRAL" as const, fechaInicio: inicioTrim, fechaFin: finTrim },
  ];

  for (const m of metricas) {
    await prisma.metricaDesempeno.create({ data: m });
  }
  console.log(`  Metricas: ${metricas.length}`);

  // ─── Notificaciones ───────────────────────────────────────────────────────
  const notificaciones = [
    { userId: ana!.id, tipo: "LOGRO" as const, titulo: "Nuevo badge desbloqueado!", mensaje: "Has obtenido el badge Aprendiz por completar tu primer curso.", url: "/logros", leida: true, fecha: new Date(hace8Meses.getTime() + 86400000 * 6) },
    { userId: ana!.id, tipo: "NUEVO_CURSO" as const, titulo: "Nuevo curso disponible", mensaje: "Se ha publicado Fundamentos de Marketing Digital.", url: "/cursos/fundamentos-marketing-digital", leida: true, fecha: new Date(now.getTime() - 86400000 * 15) },
    { userId: ana!.id, tipo: "RECORDATORIO" as const, titulo: "Continua tu aprendizaje", mensaje: "Te falta poco para completar Canales y estrategias.", url: "/cursos/fundamentos-marketing-digital", leida: false, fecha: new Date(now.getTime() - 86400000) },
    { userId: carlos!.id, tipo: "LOGRO" as const, titulo: "Badge Constante obtenido!", mensaje: "30 dias consecutivos aprendiendo.", url: "/logros", leida: true, fecha: new Date(now.getTime() - 86400000 * 60) },
    { userId: carlos!.id, tipo: "OBJETIVO_CUMPLIDO" as const, titulo: "Objetivo casi alcanzado", mensaje: "Tu cuota de ventas esta al 92%.", url: "/desempeno", leida: false, fecha: new Date(now.getTime() - 86400000 * 5) },
    { userId: carlos!.id, tipo: "SISTEMA" as const, titulo: "Actualizacion de plataforma", mensaje: "Nuevas funcionalidades disponibles.", leida: false, fecha: new Date(now.getTime() - 86400000 * 2) },
    { userId: maria!.id, tipo: "NUEVO_CURSO" as const, titulo: "Bienvenida a Educanet!", mensaje: "Comienza tu induccion.", url: "/cursos/induccion-empresa", leida: true, fecha: hace3Meses },
    { userId: maria!.id, tipo: "RECORDATORIO" as const, titulo: "No olvides tu induccion", mensaje: "Continua con el curso de induccion.", url: "/cursos/induccion-empresa", leida: false, fecha: new Date(now.getTime() - 86400000 * 3) },
  ];

  for (const n of notificaciones) {
    await prisma.notificacion.create({ data: n });
  }
  console.log(`  Notificaciones: ${notificaciones.length}`);

  console.log("\n✓ Datos post-auth completados!");
}

main()
  .catch((e) => {
    console.error("Error en seed-post-auth:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
