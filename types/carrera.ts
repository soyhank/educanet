import type { NivelCurso, PeriodoMetrica } from "@prisma/client";

export type CursoEnRuta = {
  cursoId: string;
  requerido: boolean;
  orden: number;
  curso: {
    id: string;
    slug: string;
    titulo: string;
    nivel: NivelCurso;
    duracionMinutos: number;
    instructorNombre: string;
    thumbnailUrl: string | null;
  };
  porcentaje: number;
  estado: "no-iniciado" | "en-progreso" | "completado";
};

export type MetricaEnRuta = {
  id: string;
  nombre: string;
  descripcion: string | null;
  valorObjetivo: number;
  unidad: string;
  periodo: PeriodoMetrica;
  valorActual: number | null;
  cumplida: boolean;
};

export type RutaCarreraCompleta = {
  id: string;
  titulo: string;
  descripcion: string | null;
  puestoOrigen: { id: string; nombre: string; nivel: number };
  puestoDestino: { id: string; nombre: string; nivel: number };
  cursos: CursoEnRuta[];
  metricas: MetricaEnRuta[];
};

export type SiguientePaso = {
  tipo: "CURSO" | "METRICA";
  titulo: string;
  descripcion: string;
  progresoActual?: number;
  valorObjetivo?: number;
  url?: string;
};

export type ProgresoRuta = {
  porcentajeTotal: number;
  cursosCompletados: number;
  cursosTotal: number;
  metricasCumplidas: number;
  metricasTotal: number;
  siguientesPasos: SiguientePaso[];
  estaListo: boolean;
};

export type PuestoEnCamino = {
  id: string;
  nombre: string;
  nivel: number;
  esActual: boolean;
  esDestino: boolean;
  esFuturo: boolean;
};
