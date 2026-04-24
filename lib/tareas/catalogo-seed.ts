/**
 * Prompt 18 — Catálogo semilla de tareas operativas.
 *
 * Traducción de la transcripción de la reunión del 23-abril-2026 del equipo
 * Marketing (Pamela = Asistente de Eventos, Claudia = Trafficker).
 *
 * El campo `rolPuesto` es el NOMBRE del puesto (no el codigo), porque así se
 * mapea en el seed contra `prisma.puesto.findFirst({ where: { nombre: ... } })`.
 *
 * Puntos base están calibrados para que un ejecutor nominal completando sus
 * tareas del mes alcance cerca de 350 pts TAREAS_OPERATIVAS (el tope), sin
 * pasarse. Aprox: Asistente Eventos = 1 workflow webinar ≈ 130 pts base +
 * 20 bonus, + SEO recurrentes del mes.
 */

import type { CategoriaTarea, TipoTrabajoTarea, TipoDependencia, CategoriaWorkflow } from "@prisma/client";

export type TareaPlantillaSeed = {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaTarea;
  rolPuesto: string; // se resuelve a rolResponsableId en el seed
  tiempoMinimoMin: number;
  tiempoMaximoMin: number;
  tipoTrabajo: TipoTrabajoTarea;
  puntosBase: number;
  bonusATiempo?: number;
  bonusDesbloqueo?: number;
  checklist: Array<{ descripcion: string; ayuda?: string; obligatorio?: boolean }>;
};

export const CATALOGO_TAREAS_SEED: TareaPlantillaSeed[] = [
  // ========================================================================
  // PRE-WEBINAR — Asistente de Eventos (Pamela / Mateo)
  // ========================================================================
  {
    codigo: "PRE_WEB_01_KICKOFF_COMERCIAL",
    nombre: "Kickoff con Comercial",
    descripcion:
      "Reunión inicial con Comercial para definir fecha, tema y ponente del webinar.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "COORDINACION",
    puntosBase: 8,
    checklist: [
      { descripcion: "Agendar reunión con Comercial" },
      { descripcion: "Confirmar fechas disponibles según calendario de marcas" },
      { descripcion: "Revisar objetivo del webinar con el área" },
      { descripcion: "Anotar ponente propuesto o criterios de selección" },
      { descripcion: "Cerrar próximos pasos y plazos" },
    ],
  },
  {
    codigo: "PRE_WEB_02_SELECCION_PONENTE",
    nombre: "Selección y confirmación de ponente",
    descripcion:
      "Coordinar con ponente interno/externo disponibilidad y confirmación. Puede tardar hasta 1 semana según disponibilidad del especialista.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 10080,
    tipoTrabajo: "COORDINACION",
    puntosBase: 5,
    checklist: [
      { descripcion: "Contactar ponente propuesto (email + WhatsApp)" },
      { descripcion: "Explicar fecha, tema y duración estimada" },
      { descripcion: "Esperar confirmación de disponibilidad" },
      { descripcion: "Si no puede: coordinar fecha alternativa con Comercial" },
      { descripcion: "Registrar ponente confirmado en base de datos" },
    ],
  },
  {
    codigo: "PRE_WEB_03_ENVIO_FICHA_COMERCIAL",
    nombre: "Envío de ficha pre-webinar a Comercial",
    descripcion:
      "Enviar ficha al área comercial para que complete datos. Plazo: 2 días hábiles. Histórico: 80% se pasan del plazo — los recordatorios son esperables.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "COORDINACION",
    puntosBase: 4,
    checklist: [
      { descripcion: "Preparar ficha pre-webinar con datos base" },
      { descripcion: "Enviar por email formal con plazo de 2 días hábiles" },
      {
        descripcion: "Recordatorio día 1 por WhatsApp si no hay respuesta",
        ayuda: "No cuenta como retraso tuyo si Comercial no responde",
      },
      { descripcion: "Recordatorio día 2 por correo y WhatsApp si persiste" },
      { descripcion: "Máximo 3 recordatorios, luego escalar a jefe" },
    ],
  },
  {
    codigo: "PRE_WEB_04_ENVIO_FICHA_PONENTE",
    nombre: "Envío de ficha al ponente",
    descripcion:
      "Enviar ficha al especialista para completar datos técnicos del webinar.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "COORDINACION",
    puntosBase: 4,
    checklist: [
      { descripcion: "Preparar ficha específica para el ponente" },
      { descripcion: "Enviar por email con plazo de 2 días hábiles" },
      { descripcion: "Recordatorios según protocolo" },
      {
        descripcion: "Verificar que la ficha llegue completa (título, temas, imagen)",
      },
      { descripcion: "Si llega incompleta: solicitar completar antes de continuar" },
    ],
  },
  {
    codigo: "PRE_WEB_05_OPTIMIZACION_TITULO_SEO",
    nombre: "Coordinación de optimización SEO del título (con Trafficker)",
    descripcion:
      "Pedir al Trafficker que optimice el título del webinar. Tiempo de respuesta esperado: mismo día o siguiente.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 5,
    tiempoMaximoMin: 15,
    tipoTrabajo: "COORDINACION",
    puntosBase: 3,
    checklist: [
      { descripcion: "Enviar ficha pre-webinar al Trafficker" },
      { descripcion: "Esperar título optimizado (máx 1 día hábil)" },
      { descripcion: "Reenviar al ponente para confirmar" },
      { descripcion: "Registrar título final aprobado" },
    ],
  },
  {
    codigo: "PRE_WEB_05B_OPTIMIZACION_SEO_PROPIA",
    nombre: "Optimización SEO del título y creación de URL",
    descripcion:
      "Optimiza título y crea URL de landing. 10 min si la keyword está mapeada, 25-30 min si hay que buscarla (long tail).",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 6,
    checklist: [
      { descripcion: "Leer ficha pre-webinar completa para contexto" },
      { descripcion: "Revisar público objetivo y propuesta de valor" },
      {
        descripcion: "Identificar keyword principal (lista propia o long tail research)",
        ayuda: "Si no está mapeada, investigar 15-20 min máximo",
      },
      { descripcion: "Proponer título optimizado" },
      { descripcion: "Crear URL de landing con palabra clave" },
      { descripcion: "Enviar a Eventos para confirmación con ponente" },
    ],
  },
  {
    codigo: "PRE_WEB_06_SOLICITUD_IMAGENES",
    nombre: "Solicitud de imágenes a Diseño",
    descripcion:
      "Pedir al diseñador piezas gráficas. Tiempo: mismo día si urgente, hasta 1 semana con carga normal.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 60,
    tipoTrabajo: "COORDINACION",
    puntosBase: 4,
    checklist: [
      { descripcion: "Enviar brief a Diseño con título, fecha, marca" },
      { descripcion: "Indicar si es urgente (atraso de ponente) o regular" },
      { descripcion: "Esperar recepción de piezas" },
      {
        descripcion: "Verificar peso y formato web (coordinar con Trafficker)",
        ayuda: "Tarea detectada como faltante en la reunión de abril 2026",
      },
      { descripcion: "Aprobar o solicitar ajustes" },
    ],
  },
  {
    codigo: "PRE_WEB_07_CONFIG_ZOOM",
    nombre: "Configuración de Zoom con preguntas de sondeo",
    descripcion:
      "Crear evento Zoom y subir preguntas de sondeo del especialista. Respuesta especialista: 2-5 días.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 20,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 4,
    checklist: [
      { descripcion: "Crear evento Zoom con fecha, hora, duración" },
      { descripcion: "Configurar registro con campos requeridos" },
      { descripcion: "Solicitar preguntas de sondeo al especialista" },
      { descripcion: "Subir preguntas al Zoom cuando se reciban" },
      { descripcion: "Verificar que registro funcione correctamente" },
    ],
  },
  {
    codigo: "PRE_WEB_08_CAMPANA_META_ADS",
    nombre: "Configuración de campaña publicitaria en Meta Ads",
    descripcion:
      "Tarea oficialmente del Trafficker. Ha sido ejecutada por Eventos por sobrecarga — si la ejecutás y no sos Trafficker, usá el toggle de ayuda cruzada. Configuración: 45 min máx.",
    categoria: "CAMPANA_META_ADS",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 6,
    bonusDesbloqueo: 5,
    checklist: [
      { descripcion: "Abrir Ads Manager de Meta" },
      {
        descripcion: "Crear campaña con objetivo de conversión (formulario instantáneo)",
      },
      { descripcion: "Configurar público objetivo según ficha pre-webinar" },
      {
        descripcion: "Escribir copies llamativos (sin necesidad de aprobación previa)",
      },
      { descripcion: "Configurar presupuesto y fechas" },
      { descripcion: "Activar campaña" },
      {
        descripcion: "Revisar públicos guardados al día siguiente (ajustar si hay solapamiento)",
      },
    ],
  },
  {
    codigo: "PRE_WEB_09_CERTIFICADO",
    nombre: "Creación/edición de certificado de asistencia",
    descripcion: "Editar certificado con datos del webinar (nombre, fecha, ponente).",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      { descripcion: "Abrir plantilla de certificado" },
      { descripcion: "Actualizar título del webinar" },
      { descripcion: "Actualizar fecha" },
      { descripcion: "Actualizar nombre del ponente" },
      { descripcion: "Verificar diseño y exportar" },
    ],
  },
  {
    codigo: "PRE_WEB_10_FORMULARIO_HUBSPOT",
    nombre: "Coordinación de formulario HubSpot con Jefe de Marketing",
    descripcion: "Coordinar con el Jefe de Marketing el formulario HubSpot.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 45,
    tipoTrabajo: "COORDINACION",
    puntosBase: 3,
    checklist: [
      {
        descripcion: "Solicitar al Jefe creación/actualización de formulario",
      },
      { descripcion: "Proporcionar campos requeridos" },
      { descripcion: "Esperar confirmación (suele responder mismo día)" },
      { descripcion: "Obtener código embed del formulario" },
    ],
  },
  {
    codigo: "PRE_WEB_11_LANDING_LUIS",
    nombre: "Solicitud de landing page a desarrollo",
    descripcion:
      "Pedir al equipo de desarrollo que publique la landing con datos del webinar.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "COORDINACION",
    puntosBase: 3,
    checklist: [
      {
        descripcion: "Enviar a Desarrollo: título, imagen, formulario, script",
      },
      { descripcion: "Verificar URL recibida" },
      { descripcion: "Revisar landing publicada (desktop + mobile)" },
      { descripcion: "Solicitar ajustes si aplica" },
    ],
  },
  {
    codigo: "PRE_WEB_12_GRUPO_WHATSAPP",
    nombre: "Creación y gestión de grupo de WhatsApp",
    descripcion:
      "Crear grupo de WhatsApp del webinar y gestionar mensajes durante las ~3 semanas de campaña.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 120,
    tipoTrabajo: "COORDINACION",
    puntosBase: 5,
    checklist: [
      { descripcion: "Crear grupo de WhatsApp con nombre del webinar" },
      { descripcion: "Preparar mensaje de bienvenida automático" },
      { descripcion: "Enviar mensajes de recordatorio durante campaña" },
      { descripcion: "Moderar preguntas de asistentes" },
      { descripcion: "Cerrar grupo post-webinar" },
    ],
  },
  {
    codigo: "PRE_WEB_13_PRESENTACION_COMERCIAL",
    nombre: "Presentación comercial (PPT de apertura y cierre)",
    descripcion:
      "Hacer PPT de presentación comercial. 1-4 horas dependiendo de cambios solicitados por la marca.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 240,
    tipoTrabajo: "EJECUCION",
    puntosBase: 6,
    checklist: [
      { descripcion: "Consultar si hay cambios solicitados por la marca" },
      {
        descripcion: "Consultar qué cursos abiertos mencionar",
        ayuda: "Preguntar al responsable de cursos (ej. Marcos)",
      },
      { descripcion: "Actualizar diapositivas con info del webinar" },
      { descripcion: "Revisar título y mensaje de marca" },
      { descripcion: "Exportar PPT final" },
    ],
  },
  {
    codigo: "PRE_WEB_14_ENCUESTA_FINAL",
    nombre: "Creación de encuesta final del webinar",
    descripcion: "Preparar encuesta que se mostrará al finalizar el webinar.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      { descripcion: "Revisar plantilla de encuesta" },
      { descripcion: "Ajustar preguntas específicas del webinar" },
      { descripcion: "Guardar y vincular al evento Zoom" },
    ],
  },
  {
    codigo: "PRE_WEB_15_FORMULARIO_GOOGLE",
    nombre: "Formulario Google complementario",
    descripcion: "Crear formulario de Google complementario al de HubSpot.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      { descripcion: "Consultar con Comercial si hay cambios en preguntas" },
      { descripcion: "Crear/duplicar formulario Google" },
      { descripcion: "Ajustar preguntas" },
      { descripcion: "Probar que funcione" },
    ],
  },

  // ========================================================================
  // DÍA DEL WEBINAR
  // ========================================================================
  {
    codigo: "DIA_WEB_01_MODERACION",
    nombre: "Moderación del webinar en vivo",
    descripcion:
      "1h de preparación + 2h de webinar en vivo. Abrir sala 20min antes, verificar audio/video expositor, enviar recordatorios finales.",
    categoria: "DURANTE_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 180,
    tiempoMaximoMin: 240,
    tipoTrabajo: "EJECUCION",
    puntosBase: 12,
    bonusATiempo: 3,
    checklist: [
      { descripcion: "Enviar correos/mensajes finales 40-60 min antes" },
      { descripcion: "Abrir sala Zoom 20 min antes" },
      { descripcion: "Verificar audio y diapositivas del expositor" },
      { descripcion: "Recibir asistentes" },
      { descripcion: "Moderar durante el webinar (preguntas, tiempos)" },
      { descripcion: "Lanzar encuesta al final" },
      { descripcion: "Cerrar sala correctamente" },
    ],
  },

  // ========================================================================
  // POST-WEBINAR
  // ========================================================================
  {
    codigo: "POST_WEB_01_ANALISIS_DATOS",
    nombre: "Análisis de reporte de datos del Zoom",
    descripcion:
      "Descargar data de Zoom, filtrar duplicados (usuarios por múltiples dispositivos), obtener asistentes únicos reales.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 45,
    tiempoMaximoMin: 120,
    tipoTrabajo: "ANALISIS",
    puntosBase: 6,
    checklist: [
      { descripcion: "Entrar a Zoom y descargar data de inscritos" },
      { descripcion: "Descargar data de participantes" },
      {
        descripcion: "Filtrar duplicados en hoja de cálculo",
        ayuda: "Los duplicados aparecen cuando entraron por varios dispositivos",
      },
      { descripcion: "Eliminar panelistas y equipo interno" },
      { descripcion: "Obtener conteo final de asistentes únicos" },
      { descripcion: "Calcular tasa de asistencia" },
    ],
  },
  {
    codigo: "POST_WEB_02_ANALISIS_ENCUESTA",
    nombre: "Análisis de encuesta final con ChatGPT",
    descripcion:
      "Analizar respuestas de encuesta post-webinar, detectar interesados en test drive, cursos, licencias.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 90,
    tipoTrabajo: "ANALISIS",
    puntosBase: 5,
    checklist: [
      { descripcion: "Descargar respuestas de encuesta" },
      { descripcion: "Pasar a ChatGPT para síntesis" },
      {
        descripcion: "Identificar interesados específicos (test drive, cursos, licencias)",
      },
      { descripcion: "Calcular % de encuestados sobre asistentes" },
      { descripcion: "Anotar observaciones del webinar" },
    ],
  },
  {
    codigo: "POST_WEB_03_REPORTE_GERENCIAL",
    nombre: "Reporte consolidado a gerencia y comercial",
    descripcion:
      "Reporte completo con asistencia, análisis de encuesta, leads destacados. Medio día de trabajo.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 120,
    tiempoMaximoMin: 240,
    tipoTrabajo: "ANALISIS",
    puntosBase: 8,
    checklist: [
      { descripcion: "Consolidar datos de asistencia + encuesta + interesados" },
      { descripcion: "Armar Excel con registrados, asistentes, encuestados" },
      { descripcion: "Escribir observaciones y recomendaciones" },
      { descripcion: "Derivar leads específicos a comercial o responsable de cursos" },
      { descripcion: "Enviar por email a gerencia y comercial" },
    ],
  },
  {
    codigo: "POST_WEB_04_FICHA_POST_WEBINAR",
    nombre: "Solicitud y seguimiento de ficha post-webinar al especialista",
    descripcion:
      "Pedir al especialista ficha/resumen post-webinar. Histórico: 1-2 semanas. Las quejas del especialista son habituales.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 20160,
    tipoTrabajo: "COORDINACION",
    puntosBase: 5,
    checklist: [
      {
        descripcion: "Enviar email solicitando ficha post-webinar (500 palabras mínimo)",
      },
      { descripcion: "Recordatorios día 3, día 7, día 10" },
      { descripcion: "Verificar que ficha cumpla 500 palabras y tenga estructura" },
      { descripcion: "Si llega incompleta: solicitar completar" },
      { descripcion: "Pasar al Trafficker para optimización SEO" },
    ],
  },
  {
    codigo: "POST_WEB_05_OPTIMIZACION_SEO_ARTICULO",
    nombre: "Optimización SEO del artículo post-webinar",
    descripcion:
      "Optimizar artículo con keywords, H2, imagen. 30-40 minutos.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 5,
    checklist: [
      { descripcion: "Leer ficha post-webinar" },
      { descripcion: "Seleccionar palabra clave principal de lista propia" },
      { descripcion: "Insertar keyword en título y H2" },
      { descripcion: "Optimizar metadatos de imagen (alt text con keyword)" },
      {
        descripcion: "Verificar peso de imagen y formato web",
        ayuda: "Tarea detectada como faltante en reunión de abril 2026",
      },
      { descripcion: "Entregar artículo optimizado a Eventos" },
    ],
  },
  {
    codigo: "POST_WEB_06_VERIFICACION_PONENTE",
    nombre: "Verificación de artículo con ponente",
    descripcion:
      "Enviar artículo optimizado al ponente para que verifique términos técnicos. 1-3 días.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 4320,
    tipoTrabajo: "COORDINACION",
    puntosBase: 3,
    checklist: [
      { descripcion: "Enviar artículo optimizado al ponente" },
      { descripcion: "Solicitar verificación de términos técnicos" },
      { descripcion: "Aplicar correcciones si aplica" },
      { descripcion: "Obtener visto bueno final" },
    ],
  },
  {
    codigo: "POST_WEB_07_PUBLICACION_LANDING",
    nombre: "Publicación en landing + YouTube + vinculación Zapier",
    descripcion:
      "Enviar a Desarrollo para subir artículo a web, subir video a YouTube editado, vincular Zapier para envío automático.",
    categoria: "POST_WEBINAR",
    rolPuesto: "Asistente de Eventos",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 120,
    tipoTrabajo: "COORDINACION",
    puntosBase: 4,
    checklist: [
      { descripcion: "Solicitar edición de clips del webinar" },
      { descripcion: "Subir video a YouTube" },
      { descripcion: "Enviar a Desarrollo: artículo + imagen + script" },
      { descripcion: "Desarrollo publica landing" },
      { descripcion: "Pedir vinculación Zapier con video YouTube" },
      { descripcion: "Verificar que flujo automático funcione" },
    ],
  },

  // ========================================================================
  // SEO RECURRENTE — Trafficker
  // ========================================================================
  {
    codigo: "SEO_REC_01_SEARCH_CONSOLE",
    nombre: "Revisión semanal de Search Console",
    descripcion:
      "Revisar errores de rastreo, caídas de impresiones/clics, posicionamiento.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 30,
    tipoTrabajo: "ANALISIS",
    puntosBase: 4,
    checklist: [
      { descripcion: "Entrar a Google Search Console" },
      { descripcion: "Revisar errores de rastreo" },
      { descripcion: "Identificar caídas de impresiones/clics" },
      { descripcion: "Anotar URLs problemáticas" },
      { descripcion: "Escalar a Desarrollo si requiere cambios técnicos" },
    ],
  },
  {
    codigo: "SEO_REC_02_REVISION_KEYWORDS_AUTODESK",
    nombre: "Revisión de posicionamiento keywords Autodesk",
    descripcion:
      "Revisar keywords y posicionamiento en SEMrush para marca Autodesk (marca con más licencias). Medio día.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 180,
    tiempoMaximoMin: 300,
    tipoTrabajo: "ANALISIS",
    puntosBase: 8,
    checklist: [
      {
        descripcion: "Abrir SEMrush (verificar que no esté limitado)",
        ayuda: "SEMrush a veces tiene límite de consultas diarias",
      },
      { descripcion: "Revisar keywords mapeadas de Autodesk" },
      { descripcion: "Identificar keywords en top 10" },
      { descripcion: "Identificar caídas de posicionamiento" },
      { descripcion: "Anotar oportunidades de mejora" },
    ],
  },
  {
    codigo: "SEO_REC_03_REVISION_KEYWORDS_ANSYS_ORACLE",
    nombre: "Revisión de posicionamiento keywords Ansys + Oracle",
    descripcion:
      "Revisar keywords de las 2 marcas (menos licencias que Autodesk). Medio día.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 180,
    tiempoMaximoMin: 300,
    tipoTrabajo: "ANALISIS",
    puntosBase: 6,
    checklist: [
      { descripcion: "Revisar keywords de Ansys" },
      { descripcion: "Revisar keywords de Oracle" },
      { descripcion: "Consolidar en un reporte" },
    ],
  },
  {
    codigo: "SEO_REC_04_INDEXACION_NUEVAS",
    nombre: "Verificación de indexación de páginas nuevas",
    descripcion:
      "Verificar que las páginas publicadas la semana anterior estén indexadas en Google.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 3,
    tiempoMaximoMin: 15,
    tipoTrabajo: "REVISION",
    puntosBase: 2,
    checklist: [
      { descripcion: "Listar URLs publicadas la semana anterior" },
      { descripcion: "Verificar indexación con site: en Google" },
      { descripcion: "Solicitar indexación manual en Search Console si aplica" },
    ],
  },
  {
    codigo: "SEO_REC_05_VELOCIDAD_PAGINA",
    nombre: "Revisión de velocidad de página",
    descripcion: "Verificar velocidad de las páginas principales con PageSpeed.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 5,
    tiempoMaximoMin: 15,
    tipoTrabajo: "REVISION",
    puntosBase: 2,
    checklist: [
      { descripcion: "Ejecutar PageSpeed Insights en páginas top" },
      { descripcion: "Anotar scores y recomendaciones" },
      { descripcion: "Escalar a Desarrollo si hay issues críticos" },
    ],
  },
  {
    codigo: "SEO_REC_06_REPORTE_MENSUAL",
    nombre: "Reporte mensual de SEO (impresiones/clics/posiciones)",
    descripcion:
      "Reporte consolidado mensual. Detectado en reunión abril 2026 como tarea faltante.",
    categoria: "SEO_RECURRENTE",
    rolPuesto: "Trafficker",
    tiempoMinimoMin: 120,
    tiempoMaximoMin: 240,
    tipoTrabajo: "ANALISIS",
    puntosBase: 10,
    checklist: [
      { descripcion: "Consolidar data de Search Console (impresiones/clics)" },
      { descripcion: "Consolidar data de SEMrush (posiciones)" },
      { descripcion: "Consolidar data de páginas indexadas" },
      { descripcion: "Armar reporte en formato estándar" },
      { descripcion: "Enviar a jefatura" },
    ],
  },
];

// ========================================================================
// Dependencias entre tareas (FIN_A_INICIO es lo estándar)
// ========================================================================
export const DEPENDENCIAS_SEED: Array<{
  origen: string;
  destino: string;
  tipo: TipoDependencia;
}> = [
  { origen: "PRE_WEB_03_ENVIO_FICHA_COMERCIAL", destino: "PRE_WEB_04_ENVIO_FICHA_PONENTE", tipo: "FIN_A_INICIO" },
  { origen: "PRE_WEB_04_ENVIO_FICHA_PONENTE", destino: "PRE_WEB_05B_OPTIMIZACION_SEO_PROPIA", tipo: "FIN_A_INICIO" },
  { origen: "PRE_WEB_05B_OPTIMIZACION_SEO_PROPIA", destino: "PRE_WEB_06_SOLICITUD_IMAGENES", tipo: "FIN_A_INICIO" },
  { origen: "PRE_WEB_06_SOLICITUD_IMAGENES", destino: "PRE_WEB_08_CAMPANA_META_ADS", tipo: "FIN_A_INICIO" },
  { origen: "PRE_WEB_10_FORMULARIO_HUBSPOT", destino: "PRE_WEB_11_LANDING_LUIS", tipo: "FIN_A_INICIO" },
  { origen: "PRE_WEB_06_SOLICITUD_IMAGENES", destino: "PRE_WEB_11_LANDING_LUIS", tipo: "FIN_A_INICIO" },
  { origen: "POST_WEB_01_ANALISIS_DATOS", destino: "POST_WEB_03_REPORTE_GERENCIAL", tipo: "FIN_A_INICIO" },
  { origen: "POST_WEB_02_ANALISIS_ENCUESTA", destino: "POST_WEB_03_REPORTE_GERENCIAL", tipo: "FIN_A_INICIO" },
  { origen: "POST_WEB_04_FICHA_POST_WEBINAR", destino: "POST_WEB_05_OPTIMIZACION_SEO_ARTICULO", tipo: "FIN_A_INICIO" },
  { origen: "POST_WEB_05_OPTIMIZACION_SEO_ARTICULO", destino: "POST_WEB_06_VERIFICACION_PONENTE", tipo: "FIN_A_INICIO" },
  { origen: "POST_WEB_06_VERIFICACION_PONENTE", destino: "POST_WEB_07_PUBLICACION_LANDING", tipo: "FIN_A_INICIO" },
];

// ========================================================================
// Workflow plantilla — Webinar Completo (22 tareas en 21 días pre + post)
// ========================================================================
export type WorkflowPlantillaSeed = {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaWorkflow;
  duracionTotalDias: number;
  tareas: Array<{ codigo: string; orden: number; diasAntes: number }>;
};

export const WORKFLOW_WEBINAR_COMPLETO: WorkflowPlantillaSeed = {
  codigo: "WEBINAR_COMPLETO",
  nombre: "Webinar Completo (Pre + Día + Post)",
  descripcion:
    "Workflow end-to-end de webinar: 3 semanas pre-evento, día del evento, y ~2 semanas post-evento hasta publicación.",
  categoria: "WEBINAR",
  duracionTotalDias: 35,
  tareas: [
    // Pre
    { codigo: "PRE_WEB_01_KICKOFF_COMERCIAL", orden: 1, diasAntes: 21 },
    { codigo: "PRE_WEB_02_SELECCION_PONENTE", orden: 2, diasAntes: 21 },
    { codigo: "PRE_WEB_03_ENVIO_FICHA_COMERCIAL", orden: 3, diasAntes: 20 },
    { codigo: "PRE_WEB_04_ENVIO_FICHA_PONENTE", orden: 4, diasAntes: 18 },
    { codigo: "PRE_WEB_05B_OPTIMIZACION_SEO_PROPIA", orden: 5, diasAntes: 17 },
    { codigo: "PRE_WEB_06_SOLICITUD_IMAGENES", orden: 6, diasAntes: 16 },
    { codigo: "PRE_WEB_07_CONFIG_ZOOM", orden: 7, diasAntes: 15 },
    { codigo: "PRE_WEB_10_FORMULARIO_HUBSPOT", orden: 8, diasAntes: 15 },
    { codigo: "PRE_WEB_11_LANDING_LUIS", orden: 9, diasAntes: 14 },
    { codigo: "PRE_WEB_08_CAMPANA_META_ADS", orden: 10, diasAntes: 14 },
    { codigo: "PRE_WEB_12_GRUPO_WHATSAPP", orden: 11, diasAntes: 13 },
    { codigo: "PRE_WEB_09_CERTIFICADO", orden: 12, diasAntes: 7 },
    { codigo: "PRE_WEB_14_ENCUESTA_FINAL", orden: 13, diasAntes: 5 },
    { codigo: "PRE_WEB_15_FORMULARIO_GOOGLE", orden: 14, diasAntes: 3 },
    { codigo: "PRE_WEB_13_PRESENTACION_COMERCIAL", orden: 15, diasAntes: 2 },
    // Día
    { codigo: "DIA_WEB_01_MODERACION", orden: 16, diasAntes: 0 },
    // Post (diasAntes negativos = días DESPUÉS del hito)
    { codigo: "POST_WEB_01_ANALISIS_DATOS", orden: 17, diasAntes: -1 },
    { codigo: "POST_WEB_02_ANALISIS_ENCUESTA", orden: 18, diasAntes: -1 },
    { codigo: "POST_WEB_03_REPORTE_GERENCIAL", orden: 19, diasAntes: -2 },
    { codigo: "POST_WEB_04_FICHA_POST_WEBINAR", orden: 20, diasAntes: -3 },
    { codigo: "POST_WEB_05_OPTIMIZACION_SEO_ARTICULO", orden: 21, diasAntes: -10 },
    { codigo: "POST_WEB_06_VERIFICACION_PONENTE", orden: 22, diasAntes: -12 },
    { codigo: "POST_WEB_07_PUBLICACION_LANDING", orden: 23, diasAntes: -14 },
  ],
};
