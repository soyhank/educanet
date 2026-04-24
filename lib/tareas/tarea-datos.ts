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
 * Datos normalizados de una tarea — funciona con catálogo o ad-hoc.
 */
export function datosTarea(tarea: TareaConDatos) {
  if (tarea.catalogoTarea) {
    return {
      nombre: tarea.catalogoTarea.nombre,
      descripcion: tarea.catalogoTarea.descripcion,
      tiempoMinimoMin: tarea.catalogoTarea.tiempoMinimoMin,
      tiempoMaximoMin: tarea.catalogoTarea.tiempoMaximoMin,
      puntosBase: tarea.catalogoTarea.puntosBase,
      bonusATiempo: tarea.catalogoTarea.bonusATiempo,
      bonusDesbloqueo: tarea.catalogoTarea.bonusDesbloqueo,
      categoria: tarea.catalogoTarea.categoria,
      esAdHoc: false,
    };
  }
  return {
    nombre: tarea.nombreAdHoc ?? "Tarea sin nombre",
    descripcion: tarea.descripcionAdHoc ?? "",
    tiempoMinimoMin: tarea.tiempoEstimadoMinAdHoc ?? 30,
    tiempoMaximoMin: tarea.tiempoEstimadoMaxAdHoc ?? 60,
    puntosBase: tarea.puntosBaseAdHoc ?? 5,
    bonusATiempo: 0,
    bonusDesbloqueo: 0,
    categoria: "COORDINACION_GENERAL",
    esAdHoc: true,
  };
}

export const TOPE_MENSUAL_COMPROMISOS = 200;
