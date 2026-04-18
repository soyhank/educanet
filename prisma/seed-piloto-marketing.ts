import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { KPIS_POR_PUESTO } from "../lib/kpis/definiciones-seed";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

/**
 * Piloto de Marketing: 5 puestos + definiciones de KPI + usuarios del piloto
 * + KpiAsignaciones del mes actual + registros semanales realistas.
 *
 * Requiere que los siguientes usuarios existan en Supabase Auth:
 *   content@educanet.local, trafficker@educanet.local,
 *   disenador@educanet.local, eventos@educanet.local
 *
 * (jefe.marketing@educanet.local ya existe).
 */

const PUESTOS_PILOTO = [
  {
    id: "puesto-content-manager",
    nombre: "Content Manager",
    nivel: 2,
    descripcion: "Responsable del plan editorial y contenido de marca",
    orden: 10,
    kpisKey: "CONTENT_MANAGER" as const,
    email: "content@educanet.local",
    perfil: { nombre: "Sofia", apellido: "Martinez" },
  },
  {
    id: "puesto-trafficker",
    nombre: "Trafficker / SEO / SEM",
    nivel: 2,
    descripcion: "Gestion de pauta pagada y optimizacion de conversion",
    orden: 11,
    kpisKey: "TRAFFICKER" as const,
    email: "trafficker@educanet.local",
    perfil: { nombre: "Diego", apellido: "Rivas" },
  },
  {
    id: "puesto-disenador",
    nombre: "Disenador Grafico",
    nivel: 2,
    descripcion: "Produccion visual y cumplimiento del manual de marca",
    orden: 12,
    kpisKey: "DISENADOR_GRAFICO" as const,
    email: "disenador@educanet.local",
    perfil: { nombre: "Lucia", apellido: "Fernandez" },
  },
  {
    id: "puesto-jefe-marketing",
    nombre: "Jefe de Marketing",
    nivel: 3,
    descripcion: "Direccion del area y desarrollo del equipo",
    orden: 13,
    kpisKey: "JEFE_MARKETING" as const,
    email: "jefe.marketing@educanet.local",
    perfil: null, // ya tiene perfil
  },
  {
    id: "puesto-eventos",
    nombre: "Asistente de Eventos",
    nivel: 1,
    descripcion: "Coordinacion y ejecucion de eventos de la marca",
    orden: 14,
    kpisKey: "ASISTENTE_EVENTOS" as const,
    email: "eventos@educanet.local",
    perfil: { nombre: "Mateo", apellido: "Chavez" },
  },
];

function isoWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff =
    (target.getTime() - firstThursday.getTime()) / (1000 * 60 * 60 * 24);
  return 1 + Math.round((diff - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

async function main() {
  console.log("Sembrando piloto de Marketing...\n");

  const marketing = await prisma.area.findUnique({
    where: { nombre: "Marketing" },
    select: { id: true },
  });
  if (!marketing) {
    console.error("Area Marketing no existe. Corre db:seed primero.");
    process.exit(1);
  }

  // 1. Crear/actualizar puestos
  for (const p of PUESTOS_PILOTO) {
    await prisma.puesto.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        nombre: p.nombre,
        nivel: p.nivel,
        areaId: marketing.id,
        descripcion: p.descripcion,
        orden: p.orden,
      },
      update: {
        nombre: p.nombre,
        nivel: p.nivel,
        areaId: marketing.id,
        descripcion: p.descripcion,
        orden: p.orden,
      },
    });
  }
  console.log(`  Puestos: ${PUESTOS_PILOTO.length} creados/actualizados`);

  // 2. Crear definiciones de KPI por puesto
  let totalDefs = 0;
  for (const p of PUESTOS_PILOTO) {
    const defs = KPIS_POR_PUESTO[p.kpisKey];
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      await prisma.puestoKpiDefinicion.upsert({
        where: {
          puestoId_codigo: {
            puestoId: p.id,
            codigo: d.codigo,
          },
        },
        create: {
          puestoId: p.id,
          codigo: d.codigo,
          nombre: d.nombre,
          descripcion: d.descripcion,
          unidad: d.unidad,
          peso: d.peso,
          tipoMeta: d.tipoMeta,
          valorObjetivoDefault: d.valorObjetivoDefault ?? null,
          bonusPorcentaje: d.bonusPorcentaje ?? 15,
          orden: i + 1,
        },
        update: {
          nombre: d.nombre,
          descripcion: d.descripcion,
          unidad: d.unidad,
          peso: d.peso,
          tipoMeta: d.tipoMeta,
          valorObjetivoDefault: d.valorObjetivoDefault ?? null,
          bonusPorcentaje: d.bonusPorcentaje ?? 15,
          orden: i + 1,
        },
      });
      totalDefs++;
    }
  }
  console.log(`  Definiciones KPI: ${totalDefs} creadas/actualizadas`);

  // 3. Usuarios del piloto (matchear por email)
  const usuariosPiloto = [];
  const faltantes = [];
  for (const p of PUESTOS_PILOTO) {
    const user = await prisma.user.findUnique({
      where: { email: p.email },
    });
    if (!user) {
      faltantes.push(p.email);
      continue;
    }
    const actualizado = await prisma.user.update({
      where: { id: user.id },
      data: {
        puestoId: p.id,
        areaId: marketing.id,
        ...(p.perfil ? { nombre: p.perfil.nombre, apellido: p.perfil.apellido } : {}),
      },
    });
    usuariosPiloto.push({ user: actualizado, puestoId: p.id, kpisKey: p.kpisKey });
  }

  if (faltantes.length) {
    console.log(
      `  Faltan en Supabase Auth: ${faltantes.join(", ")}. El resto se sembro correctamente.`
    );
  }

  // 4. Asignaciones del mes actual + registros de las ultimas semanas
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();
  const semanaActual = isoWeek(ahora);

  let totalAsig = 0;
  let totalRegistros = 0;
  let totalEventos = 0;

  for (const u of usuariosPiloto) {
    const defs = await prisma.puestoKpiDefinicion.findMany({
      where: { puestoId: u.puestoId, activa: true },
      orderBy: { orden: "asc" },
    });

    // Factor de "salud" del usuario: content y trafficker bajos para
    // mostrar el multiplicador. Jefe y eventos altos. Disenador medio.
    const factorSalud: Record<string, number> = {
      CONTENT_MANAGER: 0.55,
      TRAFFICKER: 0.65,
      DISENADOR_GRAFICO: 0.85,
      JEFE_MARKETING: 1.1,
      ASISTENTE_EVENTOS: 0.95,
    };
    const factor = factorSalud[u.kpisKey] ?? 0.8;

    for (const d of defs) {
      const valorObjetivo = d.valorObjetivoDefault ?? 100;
      const valorBaseline =
        d.tipoMeta === "RELATIVA_BASELINE" ? valorObjetivo * 0.9 : null;

      const asig = await prisma.kpiAsignacion.upsert({
        where: {
          userId_definicionId_periodoMes_periodoAnio: {
            userId: u.user.id,
            definicionId: d.id,
            periodoMes: mes,
            periodoAnio: anio,
          },
        },
        create: {
          userId: u.user.id,
          definicionId: d.id,
          periodoMes: mes,
          periodoAnio: anio,
          valorObjetivo,
          valorBaseline,
        },
        update: {
          valorObjetivo,
          valorBaseline,
        },
      });
      totalAsig++;

      // Crear registros de las 2 ultimas semanas (semana actual y previa)
      for (const semana of [semanaActual - 1, semanaActual]) {
        if (semana < 1) continue;
        const ruido = 0.85 + Math.random() * 0.3;
        let valor = valorObjetivo * factor * ruido;
        if (d.tipoMeta === "BINARIA") {
          valor = factor > 0.7 ? 1 : 0;
        }
        await prisma.kpiRegistroSemanal.upsert({
          where: {
            asignacionId_semanaDelAnio_anio: {
              asignacionId: asig.id,
              semanaDelAnio: semana,
              anio,
            },
          },
          create: {
            asignacionId: asig.id,
            semanaDelAnio: semana,
            anio,
            valor: Number(valor.toFixed(2)),
            reportadoPorId: u.user.id,
          },
          update: {
            valor: Number(valor.toFixed(2)),
          },
        });
        totalRegistros++;
      }
    }

    // 5. Simular algunos eventos de gamificacion para poblar el breakdown
    // (lecciones, compromisos, reconocimientos)
    const eventosSemilla: Array<{
      tipo: "LECCION_COMPLETADA" | "COMPROMISO_CUMPLIDO" | "RECONOCIMIENTO_RECIBIDO";
      fuente: "APRENDIZAJE" | "COMPROMISOS" | "RECONOCIMIENTOS";
      cantidad: number;
      repeticiones: number;
    }> = [
      {
        tipo: "LECCION_COMPLETADA",
        fuente: "APRENDIZAJE",
        cantidad: 10,
        repeticiones: Math.floor(factor * 15),
      },
      {
        tipo: "COMPROMISO_CUMPLIDO",
        fuente: "COMPROMISOS",
        cantidad: 25,
        repeticiones: Math.floor(factor * 5),
      },
      {
        tipo: "RECONOCIMIENTO_RECIBIDO",
        fuente: "RECONOCIMIENTOS",
        cantidad: 40,
        repeticiones: Math.floor(factor * 2),
      },
    ];

    for (const ev of eventosSemilla) {
      for (let i = 0; i < ev.repeticiones; i++) {
        await prisma.eventoGamificacion.create({
          data: {
            userId: u.user.id,
            tipo: ev.tipo,
            fuente: ev.fuente,
            cantidad: ev.cantidad,
            cantidadBruta: ev.cantidad,
            mesPeriodo: mes,
            anioPeriodo: anio,
          },
        });
        totalEventos++;
      }
    }

    // 6. Recalcular RangoMensual (llamamos directo a prisma porque el
    //    motor requiere import circular resuelto; para seed usamos
    //    calculo simple)
    const eventosAgg = await prisma.eventoGamificacion.groupBy({
      by: ["fuente"],
      where: { userId: u.user.id, mesPeriodo: mes, anioPeriodo: anio },
      _sum: { cantidad: true },
    });
    const porFuente: Record<string, number> = {
      APRENDIZAJE: 0,
      KPIS: 0,
      COMPROMISOS: 0,
      RECONOCIMIENTOS: 0,
      MISIONES: 0,
      EQUIPO: 0,
      SISTEMA: 0,
    };
    for (const e of eventosAgg) {
      porFuente[e.fuente] = e._sum.cantidad ?? 0;
    }
    const total = Object.values(porFuente).reduce((a, b) => a + b, 0);
    const rango =
      total >= 1800
        ? "DIAMANTE"
        : total >= 1400
          ? "ORO"
          : total >= 800
            ? "PLATA"
            : "BRONCE";

    await prisma.rangoMensual.upsert({
      where: {
        userId_periodoMes_periodoAnio: {
          userId: u.user.id,
          periodoMes: mes,
          periodoAnio: anio,
        },
      },
      create: {
        userId: u.user.id,
        periodoMes: mes,
        periodoAnio: anio,
        puntosTotales: total,
        puntosKpis: porFuente.KPIS,
        puntosCursos: porFuente.APRENDIZAJE,
        puntosCompromisos: porFuente.COMPROMISOS,
        puntosReconocimientos: porFuente.RECONOCIMIENTOS,
        puntosMisiones: porFuente.MISIONES,
        cumplimientoKpis: factor * 100,
        multiplicadorAplicado: factor < 0.7,
        rango,
      },
      update: {
        puntosTotales: total,
        puntosKpis: porFuente.KPIS,
        puntosCursos: porFuente.APRENDIZAJE,
        puntosCompromisos: porFuente.COMPROMISOS,
        puntosReconocimientos: porFuente.RECONOCIMIENTOS,
        puntosMisiones: porFuente.MISIONES,
        cumplimientoKpis: factor * 100,
        multiplicadorAplicado: factor < 0.7,
        rango,
      },
    });
  }

  console.log(`  Asignaciones: ${totalAsig}`);
  console.log(`  Registros semanales: ${totalRegistros}`);
  console.log(`  Eventos seed: ${totalEventos}`);
  console.log(`  Usuarios piloto sembrados: ${usuariosPiloto.length}`);
  console.log("\nListo.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
