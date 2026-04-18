import type { NivelCurso, TipoLeccion, TipoRecurso } from "@prisma/client";

export type EstadoCurso = "no-iniciado" | "en-progreso" | "completado";

export type CursoListado = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  descripcionCorta: string | null;
  thumbnailUrl: string | null;
  duracionMinutos: number;
  nivel: NivelCurso;
  puntosRecompensa: number;
  instructorNombre: string;
  instructorAvatarUrl: string | null;
  orden: number;
  area: { id: string; nombre: string; color: string; icono: string } | null;
  totalLecciones: number;
  leccionesCompletadas: number;
  porcentaje: number;
  estado: EstadoCurso;
};

export type LeccionConProgreso = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoLeccion;
  duracionSegundos: number;
  orden: number;
  puntosRecompensa: number;
  bunnyVideoId: string | null;
  contenidoMarkdown: string | null;
  completada: boolean;
  porcentajeVisto: number;
  tieneQuiz: boolean;
};

export type ModuloConProgreso = {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  lecciones: LeccionConProgreso[];
  completado: boolean;
  totalLecciones: number;
  leccionesCompletadas: number;
};

export type RecursoDetalle = {
  id: string;
  nombre: string;
  url: string;
  tipo: TipoRecurso;
  orden: number;
  moduloTitulo: string;
};

export type CursoDetalleCompleto = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  descripcionCorta: string | null;
  thumbnailUrl: string | null;
  duracionMinutos: number;
  nivel: NivelCurso;
  puntosRecompensa: number;
  instructorNombre: string;
  instructorAvatarUrl: string | null;
  area: { id: string; nombre: string; color: string; icono: string } | null;
  modulos: ModuloConProgreso[];
  recursos: RecursoDetalle[];
  totalLecciones: number;
  leccionesCompletadas: number;
  porcentaje: number;
  estado: EstadoCurso;
  ultimaLeccionSlug: string | null;
};
