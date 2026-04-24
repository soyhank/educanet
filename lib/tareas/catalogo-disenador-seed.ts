/**
 * Prompt 20 — Catálogo de tareas operativas: Diseñador Gráfico (Hector).
 *
 * Solo trackeo. Su problema de priorización se gestiona externamente.
 * Workflows experimentales (motion, reels) marcados con [EXPERIMENTAL].
 */
import type { CategoriaTarea, TipoTrabajoTarea } from "@prisma/client";

export type TareaDisenadorSeed = {
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

export const CATALOGO_TAREAS_DISENADOR: TareaDisenadorSeed[] = [
  // ═══════════════════════════════════════════════════════════════
  // CAMBIO DE FECHA EN ARTE EXISTENTE (la tarea más frecuente)
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_01_CAMBIO_FECHA",
    nombre: "Cambio de fecha en arte existente",
    descripcion:
      "Solicitud frecuente: cambiar fecha en arte ya producido. Representa 70% de los pedidos de cursos.",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    bonusATiempo: 1,
    checklist: [
      "Recibir ficha por correo con detalles",
      "Abrir archivo Illustrator/Photoshop existente",
      "Editar fecha en el arte",
      "Exportar PNG/JPG",
      "Subir a nube y compartir link por correo",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CAMBIO DE IMAGEN DE FONDO
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_02_CAMBIO_FONDO",
    nombre: "Cambio de imagen de fondo",
    descripcion:
      "Cambio simple de imagen de fondo manteniendo misma estructura",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 20,
    tiempoMaximoMin: 40,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      "Recibir ficha y nueva imagen",
      "Abrir archivo editable",
      "Reemplazar imagen de fondo",
      "Verificar que el diseño no se rompa",
      "Exportar y subir a nube",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ARTE NUEVO DESDE CERO
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_03_ARTE_NUEVO",
    nombre: "Arte nuevo desde cero",
    descripcion:
      "Cuando no existe plantilla previa y hay que crear maqueta nueva",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 180,
    tipoTrabajo: "EJECUCION",
    puntosBase: 6,
    bonusATiempo: 2,
    permiteVariabilidad: true,
    checklist: [
      "Recibir ficha con brief completo",
      "Pedir reunión o WhatsApp si hay dudas",
      "Crear maqueta inicial",
      "Producir arte completo",
      "Aplicar manual de marca",
      "Exportar PNG/JPG",
      "Subir editable + final a nube",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REHACER ARTE ANTIGUO (JPG → capas)
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_04_REHACER_ARTE_ANTIGUO",
    nombre: "Rehacer arte antiguo desde JPG",
    descripcion:
      "Convertir arte antiguo en JPG a capas editables, actualizar logos y estructura",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 60,
    tiempoMaximoMin: 90,
    tipoTrabajo: "EJECUCION",
    puntosBase: 5,
    checklist: [
      "Recibir referencia antigua (JPG o link Facebook)",
      "Convertir imagen JPG en capas editables",
      "Actualizar logos a versión actual",
      "Actualizar estructura (ej: niveles → etapas)",
      "Aplicar tipografía actual",
      "Exportar versión final",
      "Subir editable + final a nube",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REESCALADO DE FORMATO
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_05_REESCALADO_FORMATO",
    nombre: "Reescalado a formato distinto (story, 4x5, 19x6, portada)",
    descripcion:
      "Adaptar pieza ya hecha a otro formato considerando sangrados",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 20,
    tiempoMaximoMin: 40,
    tipoTrabajo: "EJECUCION",
    puntosBase: 3,
    checklist: [
      "Recibir solicitud de reescalado",
      "Verificar sangrados según formato destino",
      "Adaptar arte (considerar elementos de Meta Ads como CTA inferior)",
      "Verificar legibilidad en nuevo formato",
      "Exportar formatos múltiples solicitados",
      "Subir a nube y compartir",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // DOCUMENTACIÓN A NUBE (tarea diaria recurrente)
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_06_DOCUMENTACION_DIARIA",
    nombre: "Subida diaria de archivos editables a nube",
    descripcion:
      "Rutina al inicio de cada día: subir archivos del día anterior",
    categoria: "COORDINACION_GENERAL",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 10,
    tiempoMaximoMin: 30,
    tipoTrabajo: "EJECUCION",
    puntosBase: 2,
    checklist: [
      "Identificar archivos del día anterior",
      "Verificar que los archivos editables estén guardados",
      "Subir a la nube (1TB de espacio)",
      "Verificar que el upload se completó",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MOTION GRAPHIC / VIDEO REEL (EXPERIMENTAL)
  // ═══════════════════════════════════════════════════════════════
  {
    codigo: "DISENO_07_MOTION_GRAPHIC",
    nombre: "[EXPERIMENTAL] Motion graphic con texto y tiempos",
    descripcion: "Workflow nuevo. Tiempos a calibrar tras 3 ejecuciones",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 120,
    tiempoMaximoMin: 360,
    tipoTrabajo: "EJECUCION",
    puntosBase: 8,
    permiteVariabilidad: true,
    checklist: [
      "Recibir ficha con textos y tiempos",
      "Recibir links de videos referenciales si hay",
      "Crear timeline en software de motion",
      "Producir motion graphic",
      "Renderizar (considerar tiempo)",
      "Exportar formatos solicitados",
      "Subir a nube y compartir",
    ],
  },
  {
    codigo: "DISENO_08_REEL_NORMAL",
    nombre: "[EXPERIMENTAL] Reel normal con clips de video",
    descripcion: "Workflow nuevo. Edición de reel con clips ya descargados",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 90,
    tiempoMaximoMin: 240,
    tipoTrabajo: "EJECUCION",
    puntosBase: 7,
    permiteVariabilidad: true,
    checklist: [
      "Recibir links/archivos de video",
      "Descargar y organizar clips",
      "Editar reel",
      "Aplicar manual de marca",
      "Renderizar y exportar",
      "Subir a nube",
    ],
  },
  {
    codigo: "DISENO_09_VIDEO_CORPORATIVO_BUCLE",
    nombre: "[EXPERIMENTAL] Video corporativo bucle",
    descripcion:
      "Workflow nuevo. Video resumen para pantalla corporativa (tipo el de ANSYS para Cencolap)",
    categoria: "DISENO",
    rolPuesto: "Disenador Grafico",
    tiempoMinimoMin: 180,
    tiempoMaximoMin: 480,
    tipoTrabajo: "EJECUCION",
    puntosBase: 10,
    permiteVariabilidad: true,
    checklist: [
      "Recibir brief con elementos requeridos",
      "Recopilar referencias de marca",
      "Definir secuencia de información",
      "Producir video con loop seamless",
      "Incluir cierre con marca y partner",
      "Renderizar versión final",
      "Subir a nube y validar reproducción",
    ],
  },
];
