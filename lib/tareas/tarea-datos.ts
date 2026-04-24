/**
 * Función pura (sin prisma) — importable desde client components.
 */

type TareaConDatos = {
  catalogoTareaId: string | null;
  catalogoTarea: {
    nombre: string;
    descripcion: string;
    tiempoMinimoMin: number;
    tiempoMaximoMin: number;
    puntosBase: number;
    bonusATiempo: number;
    bonusDesbloqueo: number;
    categoria: string;
  } | null;
  nombreAdHoc: string | null;
  descripcionAdHoc: string | null;
  puntosBaseAdHoc: number | null;
  tiempoEstimadoMinAdHoc: number | null;
  tiempoEstimadoMaxAdHoc: number | null;
};

/**
 * Datos normalizados de una tarea.
 *
 * Prioridad: `nombreAdHoc` y `descripcionAdHoc` funcionan como OVERRIDE de
 * la instancia por encima del catálogo. Permite al usuario editar el
 * título/descripción de su tarea sin mutar la plantilla global.
 *
 * Tiempos y puntos siguen siendo del catálogo (no overridables) — solo se
 * editan directamente cuando la tarea es ad-hoc pura (sin catálogo).
 */
export function datosTarea(tarea: TareaConDatos) {
  const esAdHocPuro = !tarea.catalogoTarea;
  const nombreOverride = tarea.nombreAdHoc?.trim();
  const descripcionOverride = tarea.descripcionAdHoc?.trim();

  if (tarea.catalogoTarea) {
    return {
      nombre: nombreOverride || tarea.catalogoTarea.nombre,
      descripcion: descripcionOverride ?? tarea.catalogoTarea.descripcion,
      tiempoMinimoMin: tarea.catalogoTarea.tiempoMinimoMin,
      tiempoMaximoMin: tarea.catalogoTarea.tiempoMaximoMin,
      puntosBase: tarea.catalogoTarea.puntosBase,
      bonusATiempo: tarea.catalogoTarea.bonusATiempo,
      bonusDesbloqueo: tarea.catalogoTarea.bonusDesbloqueo,
      categoria: tarea.catalogoTarea.categoria,
      esAdHoc: false,
      tieneOverrideNombre: !!nombreOverride,
      tieneOverrideDescripcion: !!descripcionOverride,
    };
  }
  return {
    nombre: nombreOverride || "Tarea sin nombre",
    descripcion: descripcionOverride ?? "",
    tiempoMinimoMin: tarea.tiempoEstimadoMinAdHoc ?? 30,
    tiempoMaximoMin: tarea.tiempoEstimadoMaxAdHoc ?? 60,
    puntosBase: tarea.puntosBaseAdHoc ?? 5,
    bonusATiempo: 0,
    bonusDesbloqueo: 0,
    categoria: "COORDINACION_GENERAL",
    esAdHoc: true,
    tieneOverrideNombre: !!nombreOverride,
    tieneOverrideDescripcion: !!descripcionOverride,
  };
}

/**
 * Tope mensual que aplica al workflow del Prompt 18 (tareas estructuradas
 * del rol). Está desacoplado del tope de COMPROMISOS voluntarios (módulo 16B)
 * que es independiente y menor.
 */
export const TOPE_MENSUAL_TAREAS_OPERATIVAS = 400;
