export function calcularCumplimiento(valor: number, objetivo: number): number {
  if (objetivo === 0) return 0;
  return Math.round((valor / objetivo) * 100);
}

export function clasificarDesempeno(cumplimiento: number): {
  etiqueta: string;
  color: string;
  mensaje: string;
} {
  if (cumplimiento >= 100) {
    return {
      etiqueta: "Destacado",
      color: "text-success",
      mensaje: "Superaste tu objetivo. Excelente trabajo!",
    };
  }
  if (cumplimiento >= 90) {
    return {
      etiqueta: "Cumpliendo",
      color: "text-success",
      mensaje: "Estas muy cerca de tu meta. Sigue asi!",
    };
  }
  if (cumplimiento >= 75) {
    return {
      etiqueta: "En camino",
      color: "text-primary",
      mensaje: "Vas por buen camino. Un poco mas de esfuerzo!",
    };
  }
  if (cumplimiento >= 50) {
    return {
      etiqueta: "Por mejorar",
      color: "text-amber-500",
      mensaje: "Aun hay oportunidad de alcanzar tu objetivo.",
    };
  }
  return {
    etiqueta: "En desarrollo",
    color: "text-amber-500",
    mensaje: "Enfocate en las acciones clave. Tu puedes!",
  };
}
