import type { RutaCarreraCompleta, ProgresoRuta, SiguientePaso } from "@/types/carrera";

export function calcularProgresoRuta(ruta: RutaCarreraCompleta): ProgresoRuta {
  const cursosRequeridos = ruta.cursos.filter((c) => c.requerido);
  const cursosCompletados = cursosRequeridos.filter(
    (c) => c.estado === "completado"
  ).length;
  const cursosTotal = cursosRequeridos.length;

  const metricasTotal = ruta.metricas.length;
  const metricasCumplidas = ruta.metricas.filter((m) => m.cumplida).length;

  // Weighted average: 60% courses, 40% metrics
  // Adjust if one category is empty
  let porcentajeTotal: number;
  if (cursosTotal === 0 && metricasTotal === 0) {
    porcentajeTotal = 0;
  } else if (cursosTotal === 0) {
    porcentajeTotal = (metricasCumplidas / metricasTotal) * 100;
  } else if (metricasTotal === 0) {
    porcentajeTotal = (cursosCompletados / cursosTotal) * 100;
  } else {
    const pcCursos = cursosCompletados / cursosTotal;
    const pcMetricas = metricasCumplidas / metricasTotal;
    porcentajeTotal = (pcCursos * 0.6 + pcMetricas * 0.4) * 100;
  }

  porcentajeTotal = Math.round(porcentajeTotal);

  // Build next steps (top 3 pending actions)
  const siguientesPasos: SiguientePaso[] = [];

  for (const c of cursosRequeridos) {
    if (c.estado === "completado") continue;
    siguientesPasos.push({
      tipo: "CURSO",
      titulo: c.curso.titulo,
      descripcion:
        c.estado === "en-progreso"
          ? `${c.porcentaje}% completado`
          : "No iniciado",
      progresoActual: c.porcentaje,
      url: `/cursos/${c.curso.slug}`,
    });
    if (siguientesPasos.length >= 3) break;
  }

  if (siguientesPasos.length < 3) {
    for (const m of ruta.metricas) {
      if (m.cumplida) continue;
      siguientesPasos.push({
        tipo: "METRICA",
        titulo: m.nombre,
        descripcion: m.valorActual !== null
          ? `${m.valorActual} de ${m.valorObjetivo} ${m.unidad}`
          : "Pendiente de evaluacion",
        progresoActual: m.valorActual ?? undefined,
        valorObjetivo: m.valorObjetivo,
      });
      if (siguientesPasos.length >= 3) break;
    }
  }

  return {
    porcentajeTotal,
    cursosCompletados,
    cursosTotal,
    metricasCumplidas,
    metricasTotal,
    siguientesPasos,
    estaListo: porcentajeTotal >= 100,
  };
}
