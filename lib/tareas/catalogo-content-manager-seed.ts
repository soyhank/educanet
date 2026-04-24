/**
 * Prompt 20 — Catálogo de tareas operativas: Content Manager (Nadia).
 *
 * Tiempos estandarizados asumiendo 1+ semana de onboarding completado.
 * Workflows experimentales marcados con [EXPERIMENTAL] en el nombre.
 */
import type { CategoriaTarea, TipoTrabajoTarea } from "@prisma/client";

export type TareaContentSeed = {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaTarea;
  rolPuesto: string;
  tiempoMinimoMin: number;
  tiempoMaximoMin: number;
  tipoTrabajo: TipoTrabajoTarea;
  puntosBase: number;
  bonusATiempo?: number;
  bonusDesbloqueo?: number;
  permiteVariabilidad?: boolean;
  checklist: string[];
};

export const CATALOGO_TAREAS_CONTENT_MANAGER: TareaContentSeed[] = [
  // ═══════════════════════════════════════════════════════════════
  // PRE-WEBINAR — Producción de contenido
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_PRE_WEB_01_RECEPCION_FICHA",
    nombre: "Recepción y lectura de ficha del especialista",
    descripcion:
      "Leer ficha del webinar para entender temas a cubrir en redes",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      "Recibir ficha por correo o Discord",
      "Identificar temas principales del webinar",
      "Identificar imágenes disponibles para el Content Manager",
      "Anotar marca, ponente y fecha del webinar",
      "Confirmar recepción al especialista",
    ],
  },
  {
    codigo: "CONTENT_PRE_WEB_02_INVESTIGACION",
    nombre: "Investigación y generación de ideas de contenido",
    descripcion:
      "Buscar referencias, generar 5-10 ideas de posts (estáticos/videos) usando ChatGPT, Claude y referencias web",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 45,
    tiempoMaximoMin: 120,
    tipoTrabajo: "ANALISIS",
    puntosBase: 6,
    bonusATiempo: 2,
    checklist: [
      "Buscar referencias en internet relacionadas al tema",
      "Consultar herramientas IA (ChatGPT, Claude) para inspiración",
      "Generar mínimo 5 ideas de contenido",
      "Mezclar formatos: estáticos y video",
      "Documentar ideas en archivo de trabajo",
    ],
  },
  {
    codigo: "CONTENT_PRE_WEB_03_VALIDACION_ESPECIALISTA",
    nombre: "Validación de ideas con especialista",
    descripcion:
      "Enviar ideas al especialista (Sergio para ANSYS, etc.) y esperar feedback. SLA acordado: 2 días.",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 15,
    tiempoMaximoMin: 4320,
    tipoTrabajo: "COORDINACION",
    puntosBase: 4,
    checklist: [
      "Enviar ideas al especialista por correo o WhatsApp",
      "Marcar lo que requiere chequeo específico",
      "Indicar SLA de 2 días máximo",
      "Aplicar correcciones recibidas",
      "Confirmar versión final con especialista",
    ],
  },
  {
    codigo: "CONTENT_PRE_WEB_04_PROGRAMACION_METRICOOL",
    nombre: "Programación de posts en Metricool",
    descripcion: "Programar 3-4 posts validados en Metricool antes del webinar",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 4,
    checklist: [
      "Validar caption final",
      "Validar imagen final",
      "Validar texto sin errores ortográficos",
      "Programar en Metricool con fecha y hora",
      "Verificar que la fecha es ≥ 3 días antes del webinar",
    ],
  },
  {
    codigo: "CONTENT_PRE_WEB_05_VERIFICACION_PREVIA",
    nombre: "Verificación pre-publicación",
    descripcion: "Doble check de errores humanos antes de que se publique",
    categoria: "PRE_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 15,
    tipoTrabajo: "REVISION",
    puntosBase: 2,
    checklist: [
      "Revisar ortografía del caption",
      "Verificar que la imagen sea la correcta",
      "Verificar mención correcta de marca y ponente",
      "Verificar links si los hay",
      "Confirmar programación final",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // POST-WEBINAR — Cierre de contenido
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_POST_WEB_01_CORREO_AGRADECIMIENTO",
    nombre: "Correo de agradecimiento",
    descripcion:
      "Enviar correo de agradecimiento con link de Zoom proporcionado por Pamela",
    categoria: "POST_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 5,
    tiempoMaximoMin: 10,
    tipoTrabajo: "EJECUCION",
    puntosBase: 2,
    checklist: [
      "Recibir link de Zoom y contraseña de Pamela",
      "Cambiar link en plantilla de correo",
      "Verificar lista de envío",
      "Enviar correo",
      "Confirmar envío exitoso",
    ],
  },
  {
    codigo: "CONTENT_POST_WEB_02_EDICION_VIDEO",
    nombre: "Edición de bloques de video del webinar",
    descripcion:
      "Transcribir, identificar segmentos clave y cortar bloques de video del webinar",
    categoria: "POST_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 90,
    tiempoMaximoMin: 180,
    tipoTrabajo: "EJECUCION",
    puntosBase: 8,
    checklist: [
      "Descargar grabación del webinar",
      "Transcribir audio",
      "Identificar segmentos relevantes (de qué minuto a qué minuto)",
      "Cortar bloques en CapCut/Premiere",
      "Renderizar y guardar bloques",
    ],
  },
  {
    codigo: "CONTENT_POST_WEB_03_FORMULARIO_POST",
    nombre: "Script de formulario post-webinar",
    descripcion: "Crear el script del formulario post-webinar y entregarlo a Pamela",
    categoria: "POST_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 5,
    tiempoMaximoMin: 10,
    tipoTrabajo: "EJECUCION",
    puntosBase: 2,
    checklist: [
      "Redactar script del formulario",
      "Incluir link de YouTube si aplica",
      "Pasar a Pamela para implementación",
      "Confirmar recepción",
    ],
  },
  {
    codigo: "CONTENT_POST_WEB_04_AUTOMATIZACION_YOUTUBE",
    nombre: "Subida y automatización con YouTube + Zapier",
    descripcion: "Subir grabación a YouTube y automatizar envío posterior",
    categoria: "POST_WEBINAR",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 4,
    checklist: [
      "Subir grabación a YouTube (canal correcto)",
      "Optimizar título, descripción y tags",
      "Vincular Zapier para envío automático",
      "Verificar que la automatización funcione",
      "Documentar URL de YouTube",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTENIDO PARA CURSOS
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_CURSO_01_GESTION_GRAFICA",
    nombre: "Gestión de gráfica para post de curso",
    descripcion:
      "Pedir gráfica nueva a Hector o reutilizar la de Claudia. Es solicitud o reutilización.",
    categoria: "CONTENIDO_CURSOS",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "COORDINACION",
    puntosBase: 2,
    checklist: [
      "Verificar si ya existe gráfica reutilizable de Claudia",
      "Si no existe: solicitar a Hector con brief",
      "Si existe: confirmar uso",
      "Recibir gráfica final",
      "Validar que cumple manual de marca",
    ],
  },
  {
    codigo: "CONTENT_CURSO_02_CREAR_CAPTION",
    nombre: "Creación de caption para curso",
    descripcion: "Redactar caption para post de curso",
    categoria: "CONTENIDO_CURSOS",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 20,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      "Identificar especialidad o curso específico",
      "Redactar caption inicial",
      "Aplicar tono de marca",
      "Incluir CTA claro",
      "Revisar ortografía",
    ],
  },
  {
    codigo: "CONTENT_CURSO_03_VALIDACION_MARCOS",
    nombre: "Validación con Marcos Pelaez",
    descripcion:
      "Enviar caption + imagen a Marcos para validación. SLA acordado: 2 días.",
    categoria: "CONTENIDO_CURSOS",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 2880,
    tipoTrabajo: "COORDINACION",
    puntosBase: 3,
    checklist: [
      "Enviar caption e imagen a Marcos",
      "Marcar como pendiente en calendario Discord",
      "Esperar feedback (máx 2 días)",
      "Aplicar correcciones",
      "Marcar como corregido en calendario",
    ],
  },
  {
    codigo: "CONTENT_CURSO_04_PROGRAMACION",
    nombre: "Programación de post de curso",
    descripcion: "Programar post validado en Metricool",
    categoria: "CONTENIDO_CURSOS",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 15,
    tipoTrabajo: "EJECUCION",
    puntosBase: 2,
    checklist: [
      "Verificar caption final",
      "Verificar imagen final",
      "Programar en Metricool",
      "Confirmar fecha y hora",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CASOS DE ÉXITO AUTODESK (EXPERIMENTAL)
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_CASO_EXITO_01_FICHA_PREGUNTAS",
    nombre: "[EXPERIMENTAL] Crear ficha con preguntas para empresa",
    descripcion:
      "Workflow nuevo. Tiempos a calibrar tras 3 ejecuciones reales",
    categoria: "CONTENIDO",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 180,
    tipoTrabajo: "EJECUCION",
    puntosBase: 5,
    permiteVariabilidad: true,
    checklist: [
      "Definir objetivo del caso de éxito",
      "Crear ficha con preguntas estándar",
      "Validar con Luana",
      "Aplicar correcciones",
      "Versión final lista para enviar",
    ],
  },
  {
    codigo: "CONTENT_CASO_EXITO_02_COORDINAR_ENTREVISTA",
    nombre: "[EXPERIMENTAL] Coordinar entrevista con empresa",
    descripcion:
      "Workflow nuevo. Anticipación: mínimo 3 semanas antes de fecha hito",
    categoria: "CONTENIDO",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 30240,
    tipoTrabajo: "COORDINACION",
    puntosBase: 6,
    permiteVariabilidad: true,
    checklist: [
      "Contactar empresa con propuesta",
      "Coordinar fecha y hora de entrevista",
      "Confirmar formato (entrevista o ficha llenable)",
      "Enviar ficha con anticipación",
      "Recibir respuestas",
    ],
  },
  {
    codigo: "CONTENT_CASO_EXITO_03_PUBLICACION",
    nombre: "[EXPERIMENTAL] Caption y publicación de caso de éxito",
    descripcion:
      "Workflow nuevo. Crear caption del caso de éxito y publicar",
    categoria: "CONTENIDO",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 4,
    permiteVariabilidad: true,
    checklist: [
      "Procesar respuestas recibidas",
      "Redactar caption del caso de éxito",
      "Validar con Luana",
      "Validar con Flavio",
      "Publicar en redes",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTENIDO ORACLE
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_ORACLE_01_DIFUSION_ARTICULO",
    nombre: "Difusión de artículo Oracle",
    descripcion: "Crear caption pequeño para difundir artículo de Oracle",
    categoria: "CONTENIDO",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      "Recibir artículo de Oracle",
      "Crear caption breve y atractivo",
      "Validar con especialista de Oracle",
      "Validar con área comercial",
      "Programar publicación",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // BOLETINES MENSUALES
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "CONTENT_BOLETIN_MENSUAL",
    nombre: "Diseño y envío de boletín mensual",
    descripcion: "Diseñar boletín mensual desde cero o ajustar plantilla",
    categoria: "CONTENIDO",
    rolPuesto: "Content Manager",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 90,
    tipoTrabajo: "EJECUCION",
    puntosBase: 5,
    checklist: [
      "Recopilar contenido del mes",
      "Diseñar/ajustar plantilla",
      "Aplicar contenido",
      "Validar con jefe",
      "Enviar a lista de suscriptores",
    ],
  },
];
