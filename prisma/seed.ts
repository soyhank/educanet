import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // ─── Areas ────────────────────────────────────────────────────────────────
  const marketing = await prisma.area.upsert({
    where: { nombre: "Marketing" },
    update: {},
    create: {
      id: "area-marketing",
      nombre: "Marketing",
      descripcion: "Estrategia, contenido y comunicacion de marca",
      color: "#10B981",
      icono: "Megaphone",
    },
  });

  const ventas = await prisma.area.upsert({
    where: { nombre: "Ventas" },
    update: {},
    create: {
      id: "area-ventas",
      nombre: "Ventas",
      descripcion: "Gestion comercial y relacion con clientes",
      color: "#F59E0B",
      icono: "TrendingUp",
    },
  });

  const operaciones = await prisma.area.upsert({
    where: { nombre: "Operaciones" },
    update: {},
    create: {
      id: "area-operaciones",
      nombre: "Operaciones",
      descripcion: "Procesos internos, logistica y soporte",
      color: "#6366F1",
      icono: "Settings",
    },
  });

  console.log(`  Areas: ${[marketing, ventas, operaciones].length} creadas`);

  // ─── Puestos ──────────────────────────────────────────────────────────────
  const puestosData = [
    { id: "puesto-analista-jr", nombre: "Analista Jr", nivel: 1, areaId: marketing.id, descripcion: "Analista junior de marketing digital", orden: 1 },
    { id: "puesto-analista-sr", nombre: "Analista Sr", nivel: 2, areaId: marketing.id, descripcion: "Analista senior de marketing con experiencia en campanas", orden: 2 },
    { id: "puesto-coordinador", nombre: "Coordinador", nivel: 3, areaId: marketing.id, descripcion: "Coordinador del area de marketing", orden: 3 },
    { id: "puesto-ejecutivo", nombre: "Ejecutivo", nivel: 1, areaId: ventas.id, descripcion: "Ejecutivo de ventas", orden: 1 },
    { id: "puesto-supervisor", nombre: "Supervisor", nivel: 2, areaId: ventas.id, descripcion: "Supervisor del equipo de ventas", orden: 2 },
    { id: "puesto-asistente", nombre: "Asistente", nivel: 1, areaId: operaciones.id, descripcion: "Asistente de operaciones", orden: 1 },
  ];

  for (const p of puestosData) {
    await prisma.puesto.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`  Puestos: ${puestosData.length} creados`);

  // ─── Rutas de carrera ─────────────────────────────────────────────────────
  const rutaMkt = await prisma.rutaCarrera.upsert({
    where: {
      puestoOrigenId_puestoDestinoId: {
        puestoOrigenId: "puesto-analista-jr",
        puestoDestinoId: "puesto-analista-sr",
      },
    },
    update: {},
    create: {
      id: "ruta-analista-jr-sr",
      puestoOrigenId: "puesto-analista-jr",
      puestoDestinoId: "puesto-analista-sr",
      titulo: "De Analista Jr a Analista Sr",
      descripcion: "Ruta de crecimiento para analistas de marketing. Requiere dominio de herramientas digitales y liderazgo de campanas.",
      activa: true,
    },
  });

  const rutaVentas = await prisma.rutaCarrera.upsert({
    where: {
      puestoOrigenId_puestoDestinoId: {
        puestoOrigenId: "puesto-ejecutivo",
        puestoDestinoId: "puesto-supervisor",
      },
    },
    update: {},
    create: {
      id: "ruta-ejecutivo-supervisor",
      puestoOrigenId: "puesto-ejecutivo",
      puestoDestinoId: "puesto-supervisor",
      titulo: "De Ejecutivo a Supervisor",
      descripcion: "Ruta de crecimiento para el equipo comercial. Requiere cumplimiento sostenido y habilidades de liderazgo.",
      activa: true,
    },
  });

  console.log(`  Rutas de carrera: 2 creadas`);

  // Metricas de ruta
  const rutaMetricasData = [
    { rutaCarreraId: rutaMkt.id, nombre: "Cumplimiento de objetivos trimestrales", descripcion: "Porcentaje de metas de marketing alcanzadas en el trimestre", valorObjetivo: 90, unidad: "%", periodo: "TRIMESTRAL" as const },
    { rutaCarreraId: rutaMkt.id, nombre: "Evaluacion 360", descripcion: "Puntuacion promedio en evaluacion de pares, jefes y subordinados", valorObjetivo: 4.0, unidad: "pts/5", periodo: "SEMESTRAL" as const },
    { rutaCarreraId: rutaVentas.id, nombre: "Cuota de ventas mensual", descripcion: "Porcentaje de cumplimiento de la cuota asignada", valorObjetivo: 95, unidad: "%", periodo: "MENSUAL" as const },
    { rutaCarreraId: rutaVentas.id, nombre: "Satisfaccion del cliente", descripcion: "Puntuacion NPS de los clientes asignados", valorObjetivo: 4.5, unidad: "pts/5", periodo: "TRIMESTRAL" as const },
  ];

  for (const m of rutaMetricasData) {
    await prisma.rutaCarreraMetrica.create({ data: m });
  }
  console.log(`  Metricas de ruta: ${rutaMetricasData.length} creadas`);

  // ─── Badges ───────────────────────────────────────────────────────────────
  const badgesData = [
    { id: "badge-primer-paso", codigo: "PRIMER_PASO", nombre: "Primer Paso", descripcion: "Completaste tu primera leccion. El camino de mil millas comienza con un paso.", iconoUrl: "/badges/primer_paso.svg", criterioTipo: "COMPLETAR_N_LECCIONES" as const, criterioValor: { n: 1 }, puntosRecompensa: 10, orden: 1 },
    { id: "badge-aprendiz", codigo: "APRENDIZ", nombre: "Aprendiz", descripcion: "Completaste tu primer curso. Ya demuestras compromiso con tu crecimiento.", iconoUrl: "/badges/aprendiz.svg", criterioTipo: "COMPLETAR_N_CURSOS" as const, criterioValor: { n: 1 }, puntosRecompensa: 25, orden: 2 },
    { id: "badge-estudioso", codigo: "ESTUDIOSO", nombre: "Estudioso", descripcion: "5 cursos completados. Tu dedicacion es ejemplo para el equipo.", iconoUrl: "/badges/estudioso.svg", criterioTipo: "COMPLETAR_N_CURSOS" as const, criterioValor: { n: 5 }, puntosRecompensa: 100, orden: 3 },
    { id: "badge-maestro", codigo: "MAESTRO", nombre: "Maestro", descripcion: "10 cursos completados. Eres un referente de aprendizaje continuo.", iconoUrl: "/badges/maestro.svg", criterioTipo: "COMPLETAR_N_CURSOS" as const, criterioValor: { n: 10 }, puntosRecompensa: 250, orden: 4 },
    { id: "badge-constante", codigo: "CONSTANTE", nombre: "Constante", descripcion: "7 dias consecutivos aprendiendo. La constancia es la clave del exito.", iconoUrl: "/badges/constante.svg", criterioTipo: "RACHA_DIAS" as const, criterioValor: { n: 7 }, puntosRecompensa: 50, orden: 5 },
    { id: "badge-imparable", codigo: "IMPARABLE", nombre: "Imparable", descripcion: "30 dias consecutivos de aprendizaje. Nada te detiene.", iconoUrl: "/badges/imparable.svg", criterioTipo: "RACHA_DIAS" as const, criterioValor: { n: 30 }, puntosRecompensa: 200, orden: 6 },
    { id: "badge-perfeccionista", codigo: "PERFECCIONISTA", nombre: "Perfeccionista", descripcion: "Obtuviste 100% en un quiz a la primera. Precision impecable.", iconoUrl: "/badges/perfeccionista.svg", criterioTipo: "PRIMER_QUIZ_PERFECTO" as const, criterioValor: {}, puntosRecompensa: 75, orden: 7 },
    { id: "badge-mil-puntos", codigo: "MIL_PUNTOS", nombre: "Club de los Mil", descripcion: "Acumulaste 1000 puntos. Tu esfuerzo se nota.", iconoUrl: "/badges/mil_puntos.svg", criterioTipo: "PUNTOS_ACUMULADOS" as const, criterioValor: { n: 1000 }, puntosRecompensa: 100, orden: 8 },
    { id: "badge-induccion", codigo: "INDUCCION_COMPLETA", nombre: "Bienvenido a bordo", descripcion: "Completaste la induccion. Ya eres parte oficial del equipo.", iconoUrl: "/badges/induccion.svg", criterioTipo: "COMPLETAR_INDUCCION" as const, criterioValor: {}, puntosRecompensa: 50, orden: 9 },
    { id: "badge-promovido", codigo: "PROMOVIDO", nombre: "En Ascenso", descripcion: "Alcanzaste el nivel 5. Tu crecimiento profesional es notable.", iconoUrl: "/badges/promovido.svg", criterioTipo: "SUBIR_A_NIVEL" as const, criterioValor: { n: 5 }, puntosRecompensa: 150, orden: 10 },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { codigo: b.codigo },
      update: {},
      create: b,
    });
  }
  console.log(`  Badges: ${badgesData.length} creados`);

  // ─── Curso 1: Induccion ───────────────────────────────────────────────────
  const cursoInduccion = await prisma.curso.upsert({
    where: { slug: "induccion-empresa" },
    update: {},
    create: {
      id: "curso-induccion",
      slug: "induccion-empresa",
      titulo: "Induccion a la empresa",
      descripcion: "Conoce nuestra empresa, cultura, valores y las herramientas que usamos dia a dia. Este curso es obligatorio para todos los nuevos integrantes del equipo.",
      descripcionCorta: "Todo lo que necesitas saber para empezar con el pie derecho",
      duracionMinutos: 60,
      nivel: "BASICO",
      publicado: true,
      puntosRecompensa: 150,
      instructorNombre: "Equipo RRHH",
      orden: 1,
    },
  });

  // Modulos del curso de induccion
  const modInduccion1 = await prisma.modulo.upsert({
    where: { cursoId_orden: { cursoId: cursoInduccion.id, orden: 1 } },
    update: {},
    create: { id: "mod-ind-1", cursoId: cursoInduccion.id, titulo: "Bienvenida", descripcion: "Conoce quienes somos y por que hacemos lo que hacemos", orden: 1 },
  });

  const modInduccion2 = await prisma.modulo.upsert({
    where: { cursoId_orden: { cursoId: cursoInduccion.id, orden: 2 } },
    update: {},
    create: { id: "mod-ind-2", cursoId: cursoInduccion.id, titulo: "Nuestra cultura y valores", descripcion: "Los principios que guian nuestro trabajo diario", orden: 2 },
  });

  const modInduccion3 = await prisma.modulo.upsert({
    where: { cursoId_orden: { cursoId: cursoInduccion.id, orden: 3 } },
    update: {},
    create: { id: "mod-ind-3", cursoId: cursoInduccion.id, titulo: "Procesos y herramientas", descripcion: "Las herramientas y flujos que usamos en el dia a dia", orden: 3 },
  });

  // Lecciones del curso de induccion
  const leccionesInduccion = [
    { id: "lec-ind-1", moduloId: modInduccion1.id, slug: "mensaje-ceo", titulo: "Mensaje del CEO", tipo: "VIDEO" as const, duracionSegundos: 300, orden: 1, puntosRecompensa: 10 },
    { id: "lec-ind-2", moduloId: modInduccion1.id, slug: "historia-empresa", titulo: "Historia de la empresa", tipo: "VIDEO" as const, duracionSegundos: 480, orden: 2, puntosRecompensa: 10 },
    { id: "lec-ind-3", moduloId: modInduccion2.id, slug: "mision-vision", titulo: "Mision, vision y proposito", tipo: "VIDEO" as const, duracionSegundos: 360, orden: 1, puntosRecompensa: 10 },
    { id: "lec-ind-4", moduloId: modInduccion2.id, slug: "valores-accion", titulo: "Nuestros valores en accion", tipo: "VIDEO" as const, duracionSegundos: 420, orden: 2, puntosRecompensa: 10 },
    { id: "lec-ind-5", moduloId: modInduccion2.id, slug: "codigo-conducta", titulo: "Codigo de conducta", tipo: "LECTURA" as const, duracionSegundos: 600, orden: 3, puntosRecompensa: 10, contenidoMarkdown: "# Codigo de Conducta\n\nEn nuestra empresa valoramos el respeto, la transparencia y la colaboracion. Cada miembro del equipo se compromete a actuar con integridad, tratar a los demas con dignidad y contribuir a un ambiente de trabajo positivo.\n\n## Principios fundamentales\n\n1. **Respeto mutuo**: Tratamos a todos con cortesia y consideracion.\n2. **Transparencia**: Comunicamos de forma abierta y honesta.\n3. **Responsabilidad**: Cumplimos nuestros compromisos y asumimos consecuencias.\n4. **Colaboracion**: Trabajamos juntos para lograr objetivos comunes." },
    { id: "lec-ind-6", moduloId: modInduccion3.id, slug: "herramientas-comunicacion", titulo: "Herramientas de comunicacion", tipo: "VIDEO" as const, duracionSegundos: 540, orden: 1, puntosRecompensa: 10 },
    { id: "lec-ind-7", moduloId: modInduccion3.id, slug: "flujos-trabajo", titulo: "Flujos de trabajo y procesos", tipo: "VIDEO" as const, duracionSegundos: 480, orden: 2, puntosRecompensa: 10 },
    { id: "lec-ind-8", moduloId: modInduccion3.id, slug: "quiz-induccion", titulo: "Evaluacion de induccion", tipo: "QUIZ" as const, duracionSegundos: 0, orden: 3, puntosRecompensa: 20 },
  ];

  for (const l of leccionesInduccion) {
    await prisma.leccion.upsert({
      where: { moduloId_slug: { moduloId: l.moduloId, slug: l.slug } },
      update: {},
      create: { ...l, bunnyVideoId: l.tipo === "VIDEO" ? "" : null },
    });
  }
  console.log(`  Curso Induccion: 3 modulos, ${leccionesInduccion.length} lecciones`);

  // Quiz de induccion
  const quizInduccion = await prisma.quiz.upsert({
    where: { leccionId: "lec-ind-8" },
    update: {},
    create: {
      id: "quiz-induccion",
      leccionId: "lec-ind-8",
      titulo: "Evaluacion final de induccion",
      descripcion: "Demuestra que conoces nuestra empresa, cultura y herramientas",
      puntajeMinimo: 70,
    },
  });

  const preguntasInduccion = [
    {
      id: "preg-ind-1", quizId: quizInduccion.id, texto: "Cual es el valor principal que guia nuestra cultura organizacional?", tipo: "UNICA" as const, orden: 1, explicacion: "La transparencia es nuestro pilar fundamental",
      opciones: [
        { texto: "Competitividad", esCorrecta: false, orden: 1 },
        { texto: "Transparencia", esCorrecta: true, orden: 2 },
        { texto: "Velocidad", esCorrecta: false, orden: 3 },
        { texto: "Jerarquia", esCorrecta: false, orden: 4 },
      ],
    },
    {
      id: "preg-ind-2", quizId: quizInduccion.id, texto: "Cuales de las siguientes son herramientas oficiales de comunicacion?", tipo: "MULTIPLE" as const, orden: 2, explicacion: "Usamos Slack para mensajeria y Google Meet para videollamadas",
      opciones: [
        { texto: "Slack", esCorrecta: true, orden: 1 },
        { texto: "WhatsApp personal", esCorrecta: false, orden: 2 },
        { texto: "Google Meet", esCorrecta: true, orden: 3 },
        { texto: "Telegram", esCorrecta: false, orden: 4 },
      ],
    },
    {
      id: "preg-ind-3", quizId: quizInduccion.id, texto: "En que ano fue fundada la empresa?", tipo: "UNICA" as const, orden: 3, explicacion: "La empresa fue fundada en 2018",
      opciones: [
        { texto: "2015", esCorrecta: false, orden: 1 },
        { texto: "2018", esCorrecta: true, orden: 2 },
        { texto: "2020", esCorrecta: false, orden: 3 },
        { texto: "2022", esCorrecta: false, orden: 4 },
      ],
    },
    {
      id: "preg-ind-4", quizId: quizInduccion.id, texto: "Cual es el canal adecuado para reportar un problema de conducta?", tipo: "UNICA" as const, orden: 4, explicacion: "RRHH es el canal oficial para temas de conducta",
      opciones: [
        { texto: "Comentarlo en el grupo general", esCorrecta: false, orden: 1 },
        { texto: "Reportar a RRHH directamente", esCorrecta: true, orden: 2 },
        { texto: "Publicar en redes sociales", esCorrecta: false, orden: 3 },
        { texto: "Ignorarlo", esCorrecta: false, orden: 4 },
      ],
    },
    {
      id: "preg-ind-5", quizId: quizInduccion.id, texto: "Que principios incluye nuestro codigo de conducta?", tipo: "MULTIPLE" as const, orden: 5, explicacion: "Nuestro codigo se basa en respeto, transparencia, responsabilidad y colaboracion",
      opciones: [
        { texto: "Respeto mutuo", esCorrecta: true, orden: 1 },
        { texto: "Competencia interna", esCorrecta: false, orden: 2 },
        { texto: "Responsabilidad", esCorrecta: true, orden: 3 },
        { texto: "Colaboracion", esCorrecta: true, orden: 4 },
      ],
    },
  ];

  for (const p of preguntasInduccion) {
    const { opciones, ...preguntaData } = p;
    const pregunta = await prisma.pregunta.upsert({
      where: { id: p.id },
      update: {},
      create: preguntaData,
    });
    for (const o of opciones) {
      await prisma.opcionRespuesta.create({
        data: { preguntaId: pregunta.id, ...o },
      });
    }
  }
  console.log(`  Quiz induccion: 5 preguntas`);

  // ─── Curso 2: Marketing Digital ───────────────────────────────────────────
  const cursoMkt = await prisma.curso.upsert({
    where: { slug: "fundamentos-marketing-digital" },
    update: {},
    create: {
      id: "curso-mkt-digital",
      slug: "fundamentos-marketing-digital",
      titulo: "Fundamentos de Marketing Digital",
      descripcion: "Aprende las bases del marketing digital moderno: canales, estrategias, metricas y como construir un plan efectivo. Curso disenado para el equipo de marketing y cualquier colaborador interesado en el mundo digital.",
      descripcionCorta: "Domina las bases del marketing digital moderno",
      duracionMinutos: 180,
      nivel: "INTERMEDIO",
      areaId: marketing.id,
      publicado: true,
      puntosRecompensa: 300,
      instructorNombre: "Jefe de Marketing",
      orden: 2,
    },
  });

  const modMkt1 = await prisma.modulo.upsert({ where: { cursoId_orden: { cursoId: cursoMkt.id, orden: 1 } }, update: {}, create: { id: "mod-mkt-1", cursoId: cursoMkt.id, titulo: "Introduccion al Marketing Digital", descripcion: "Que es, por que importa y como ha evolucionado", orden: 1 } });
  const modMkt2 = await prisma.modulo.upsert({ where: { cursoId_orden: { cursoId: cursoMkt.id, orden: 2 } }, update: {}, create: { id: "mod-mkt-2", cursoId: cursoMkt.id, titulo: "Canales y estrategias", descripcion: "Los principales canales digitales y como elegir la estrategia correcta", orden: 2 } });
  const modMkt3 = await prisma.modulo.upsert({ where: { cursoId_orden: { cursoId: cursoMkt.id, orden: 3 } }, update: {}, create: { id: "mod-mkt-3", cursoId: cursoMkt.id, titulo: "Metricas y analitica", descripcion: "Medir, analizar y optimizar tus esfuerzos digitales", orden: 3 } });
  const modMkt4 = await prisma.modulo.upsert({ where: { cursoId_orden: { cursoId: cursoMkt.id, orden: 4 } }, update: {}, create: { id: "mod-mkt-4", cursoId: cursoMkt.id, titulo: "Plan de marketing practico", descripcion: "Construye tu propio plan de marketing digital paso a paso", orden: 4 } });

  const leccionesMkt = [
    { id: "lec-mkt-1", moduloId: modMkt1.id, slug: "que-es-mkt-digital", titulo: "Que es el marketing digital", tipo: "VIDEO" as const, duracionSegundos: 480, orden: 1, puntosRecompensa: 10 },
    { id: "lec-mkt-2", moduloId: modMkt1.id, slug: "evolucion-mkt", titulo: "Evolucion del marketing: de lo tradicional a lo digital", tipo: "VIDEO" as const, duracionSegundos: 540, orden: 2, puntosRecompensa: 10 },
    { id: "lec-mkt-3", moduloId: modMkt1.id, slug: "ecosistema-digital", titulo: "El ecosistema digital actual", tipo: "LECTURA" as const, duracionSegundos: 600, orden: 3, puntosRecompensa: 10, contenidoMarkdown: "# El ecosistema digital actual\n\nEl ecosistema digital es el conjunto de plataformas, herramientas y canales que las marcas utilizan para conectar con su audiencia. Incluye redes sociales, motores de busqueda, email, contenido y publicidad programatica.\n\n## Componentes clave\n\n- **Owned media**: Tus propios canales (sitio web, blog, redes)\n- **Earned media**: Menciones organicas, PR, resenas\n- **Paid media**: Publicidad pagada en cualquier plataforma" },
    { id: "lec-mkt-4", moduloId: modMkt2.id, slug: "seo-sem", titulo: "SEO y SEM: busqueda organica y pagada", tipo: "VIDEO" as const, duracionSegundos: 720, orden: 1, puntosRecompensa: 15 },
    { id: "lec-mkt-5", moduloId: modMkt2.id, slug: "redes-sociales", titulo: "Estrategia en redes sociales", tipo: "VIDEO" as const, duracionSegundos: 600, orden: 2, puntosRecompensa: 15 },
    { id: "lec-mkt-6", moduloId: modMkt2.id, slug: "email-marketing", titulo: "Email marketing efectivo", tipo: "VIDEO" as const, duracionSegundos: 540, orden: 3, puntosRecompensa: 15 },
    { id: "lec-mkt-7", moduloId: modMkt2.id, slug: "quiz-canales", titulo: "Evaluacion: canales y estrategias", tipo: "QUIZ" as const, duracionSegundos: 0, orden: 4, puntosRecompensa: 20 },
    { id: "lec-mkt-8", moduloId: modMkt3.id, slug: "kpis-digitales", titulo: "KPIs del marketing digital", tipo: "VIDEO" as const, duracionSegundos: 600, orden: 1, puntosRecompensa: 15 },
    { id: "lec-mkt-9", moduloId: modMkt3.id, slug: "google-analytics", titulo: "Introduccion a Google Analytics", tipo: "VIDEO" as const, duracionSegundos: 720, orden: 2, puntosRecompensa: 15 },
    { id: "lec-mkt-10", moduloId: modMkt3.id, slug: "reportes-datos", titulo: "Como construir reportes con datos", tipo: "VIDEO" as const, duracionSegundos: 480, orden: 3, puntosRecompensa: 15 },
    { id: "lec-mkt-11", moduloId: modMkt3.id, slug: "quiz-metricas", titulo: "Evaluacion: metricas y analitica", tipo: "QUIZ" as const, duracionSegundos: 0, orden: 4, puntosRecompensa: 20 },
    { id: "lec-mkt-12", moduloId: modMkt4.id, slug: "definir-objetivos", titulo: "Definir objetivos SMART", tipo: "VIDEO" as const, duracionSegundos: 420, orden: 1, puntosRecompensa: 15 },
    { id: "lec-mkt-13", moduloId: modMkt4.id, slug: "presupuesto-canales", titulo: "Presupuesto y seleccion de canales", tipo: "VIDEO" as const, duracionSegundos: 540, orden: 2, puntosRecompensa: 15 },
    { id: "lec-mkt-14", moduloId: modMkt4.id, slug: "quiz-plan-mkt", titulo: "Evaluacion final: plan de marketing", tipo: "QUIZ" as const, duracionSegundos: 0, orden: 3, puntosRecompensa: 25 },
  ];

  for (const l of leccionesMkt) {
    await prisma.leccion.upsert({
      where: { moduloId_slug: { moduloId: l.moduloId, slug: l.slug } },
      update: {},
      create: { ...l, bunnyVideoId: l.tipo === "VIDEO" ? "" : null },
    });
  }
  console.log(`  Curso Marketing Digital: 4 modulos, ${leccionesMkt.length} lecciones`);

  // Quizzes de marketing
  const quizzesMkt = [
    { id: "quiz-canales", leccionId: "lec-mkt-7", titulo: "Evaluacion de canales y estrategias", puntajeMinimo: 70 },
    { id: "quiz-metricas", leccionId: "lec-mkt-11", titulo: "Evaluacion de metricas y analitica", puntajeMinimo: 70 },
    { id: "quiz-plan-mkt", leccionId: "lec-mkt-14", titulo: "Evaluacion final del plan de marketing", puntajeMinimo: 75 },
  ];

  for (const q of quizzesMkt) {
    await prisma.quiz.upsert({
      where: { leccionId: q.leccionId },
      update: {},
      create: q,
    });
  }

  // Preguntas para quiz de canales
  const pregCanales = [
    { id: "preg-can-1", quizId: "quiz-canales", texto: "Que significa SEM?", tipo: "UNICA" as const, orden: 1, explicacion: "SEM = Search Engine Marketing", opciones: [{ texto: "Social Email Marketing", esCorrecta: false, orden: 1 }, { texto: "Search Engine Marketing", esCorrecta: true, orden: 2 }, { texto: "Sales Engagement Model", esCorrecta: false, orden: 3 }] },
    { id: "preg-can-2", quizId: "quiz-canales", texto: "Cuales son canales de owned media?", tipo: "MULTIPLE" as const, orden: 2, explicacion: "Owned media son los canales propios de la marca", opciones: [{ texto: "Blog corporativo", esCorrecta: true, orden: 1 }, { texto: "Anuncios en Google", esCorrecta: false, orden: 2 }, { texto: "Newsletter", esCorrecta: true, orden: 3 }, { texto: "Nota en un periodico", esCorrecta: false, orden: 4 }] },
    { id: "preg-can-3", quizId: "quiz-canales", texto: "Cual es la principal ventaja del email marketing?", tipo: "UNICA" as const, orden: 3, explicacion: "El email marketing tiene el mayor ROI de todos los canales digitales", opciones: [{ texto: "Es gratis", esCorrecta: false, orden: 1 }, { texto: "Tiene el mayor ROI", esCorrecta: true, orden: 2 }, { texto: "No requiere estrategia", esCorrecta: false, orden: 3 }] },
  ];

  const pregMetricas = [
    { id: "preg-met-1", quizId: "quiz-metricas", texto: "Que mide el CTR?", tipo: "UNICA" as const, orden: 1, explicacion: "CTR = Click-Through Rate, mide el porcentaje de clics sobre impresiones", opciones: [{ texto: "Costo total de la campana", esCorrecta: false, orden: 1 }, { texto: "Porcentaje de clics sobre impresiones", esCorrecta: true, orden: 2 }, { texto: "Cantidad de conversiones", esCorrecta: false, orden: 3 }] },
    { id: "preg-met-2", quizId: "quiz-metricas", texto: "Que herramienta de Google permite analizar el trafico web?", tipo: "UNICA" as const, orden: 2, explicacion: "Google Analytics es la herramienta estandar para analisis web", opciones: [{ texto: "Google Ads", esCorrecta: false, orden: 1 }, { texto: "Google Analytics", esCorrecta: true, orden: 2 }, { texto: "Google Trends", esCorrecta: false, orden: 3 }] },
  ];

  const pregPlanMkt = [
    { id: "preg-plan-1", quizId: "quiz-plan-mkt", texto: "Que caracteristica tiene un objetivo SMART?", tipo: "MULTIPLE" as const, orden: 1, explicacion: "SMART: Especifico, Medible, Alcanzable, Relevante, con Tiempo definido", opciones: [{ texto: "Especifico", esCorrecta: true, orden: 1 }, { texto: "Ambiguo", esCorrecta: false, orden: 2 }, { texto: "Medible", esCorrecta: true, orden: 3 }, { texto: "Sin fecha limite", esCorrecta: false, orden: 4 }] },
    { id: "preg-plan-2", quizId: "quiz-plan-mkt", texto: "Que se debe definir antes de elegir canales?", tipo: "UNICA" as const, orden: 2, explicacion: "Los objetivos determinan la eleccion de canales", opciones: [{ texto: "El presupuesto exacto", esCorrecta: false, orden: 1 }, { texto: "Los objetivos de marketing", esCorrecta: true, orden: 2 }, { texto: "El diseno grafico", esCorrecta: false, orden: 3 }] },
  ];

  for (const pArr of [pregCanales, pregMetricas, pregPlanMkt]) {
    for (const p of pArr) {
      const { opciones, ...preguntaData } = p;
      const pregunta = await prisma.pregunta.upsert({ where: { id: p.id }, update: {}, create: preguntaData });
      for (const o of opciones) {
        await prisma.opcionRespuesta.create({ data: { preguntaId: pregunta.id, ...o } });
      }
    }
  }
  console.log(`  Quizzes marketing: 3 quizzes, 8 preguntas totales`);

  // Vincular curso de marketing a ruta de carrera
  await prisma.rutaCarreraCurso.upsert({
    where: { rutaCarreraId_cursoId: { rutaCarreraId: rutaMkt.id, cursoId: cursoMkt.id } },
    update: {},
    create: { rutaCarreraId: rutaMkt.id, cursoId: cursoMkt.id, requerido: true, orden: 1 },
  });

  await prisma.rutaCarreraCurso.upsert({
    where: { rutaCarreraId_cursoId: { rutaCarreraId: rutaMkt.id, cursoId: cursoInduccion.id } },
    update: {},
    create: { rutaCarreraId: rutaMkt.id, cursoId: cursoInduccion.id, requerido: true, orden: 0 },
  });
  console.log(`  Cursos vinculados a rutas de carrera`);

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  // Los usuarios se crean via Supabase Auth (ver supabase/auth-sync.sql).
  // El trigger handle_new_user() los inserta automaticamente en "User".
  // Despues de crearlos en Auth, ejecutar: npm run db:seed-post-auth
  // para asignarles puestos, areas, puntos, progreso, badges, etc.

  console.log("\n✓ Seed completado exitosamente!");
  console.log("  NOTA: Los usuarios se crean via Supabase Auth.");
  console.log("  Luego ejecutar: npm run db:seed-post-auth");

  const counts = await Promise.all([
    prisma.area.count(),
    prisma.puesto.count(),
    prisma.rutaCarrera.count(),
    prisma.badge.count(),
    prisma.curso.count(),
    prisma.modulo.count(),
    prisma.leccion.count(),
    prisma.quiz.count(),
    prisma.pregunta.count(),
  ]);

  console.log("\nConteos finales:");
  console.log(`  Areas: ${counts[0]}, Puestos: ${counts[1]}, Rutas: ${counts[2]}`);
  console.log(`  Badges: ${counts[3]}, Cursos: ${counts[4]}, Modulos: ${counts[5]}`);
  console.log(`  Lecciones: ${counts[6]}, Quizzes: ${counts[7]}, Preguntas: ${counts[8]}`);
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
