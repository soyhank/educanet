/**
 * Pure calculation functions for the dashboard.
 */

export function saludoSegunHora(hora: number): string {
  if (hora < 12) return "Buenos dias";
  if (hora < 18) return "Buenas tardes";
  return "Buenas noches";
}

const frases = [
  "El aprendizaje es el unico tesoro que nadie puede robarte.",
  "Cada leccion completada es un paso hacia tu siguiente nivel.",
  "Tu constancia es tu superpoder. Sigue asi.",
  "Los grandes logros comienzan con pequenos pasos.",
  "Hoy es un gran dia para aprender algo nuevo.",
  "Tu dedicacion inspira a todo el equipo.",
  "El crecimiento profesional es un viaje, no un destino.",
  "Cada quiz aprobado demuestra tu compromiso.",
  "Eres parte de algo grande. Sigue creciendo.",
  "La mejor inversion es invertir en ti mismo.",
];

export function elegirFraseDelDia(userId: string): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash + dayOfYear) % frases.length;
  return frases[index];
}

type ModuloConLecciones = {
  lecciones: { id: string }[];
};

export function calcularProgresoCurso(
  modulos: ModuloConLecciones[],
  leccionesCompletadasIds: Set<string>
): number {
  const total = modulos.reduce((acc, m) => acc + m.lecciones.length, 0);
  if (total === 0) return 0;
  const completadas = modulos.reduce(
    (acc, m) =>
      acc + m.lecciones.filter((l) => leccionesCompletadasIds.has(l.id)).length,
    0
  );
  return Math.round((completadas / total) * 100);
}
