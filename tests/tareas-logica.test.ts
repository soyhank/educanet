import { describe, it, expect } from "vitest";

/**
 * Tests unitarios de la lógica de cálculo de puntos y validación de tareas.
 * No tocan Prisma — solo verifican invariantes del algoritmo.
 */

function calcularPuntos(params: {
  tiempoInvertidoMin: number;
  tiempoMinimoMin: number;
  tiempoMaximoMin: number;
  puntosBase: number;
  bonusATiempo: number;
  bonusDesbloqueo: number;
  tieneDependientes: boolean;
}): { puntosTotales: number; puntosATiempo: boolean; bonusDesbloqueo: boolean } {
  let puntos = params.puntosBase;
  const aTiempo =
    params.tiempoInvertidoMin >= params.tiempoMinimoMin &&
    params.tiempoInvertidoMin <= params.tiempoMaximoMin;
  if (aTiempo) puntos += params.bonusATiempo;
  const bonusDesbloqueo = params.tieneDependientes;
  if (bonusDesbloqueo) puntos += params.bonusDesbloqueo;
  return { puntosTotales: puntos, puntosATiempo: aTiempo, bonusDesbloqueo };
}

describe("Cálculo de puntos de tarea", () => {
  const base = {
    puntosBase: 6,
    bonusATiempo: 2,
    bonusDesbloqueo: 3,
    tiempoMinimoMin: 30,
    tiempoMaximoMin: 60,
    tieneDependientes: false,
  };

  it("dentro del rango: suma bonus a tiempo", () => {
    const r = calcularPuntos({ ...base, tiempoInvertidoMin: 45 });
    expect(r.puntosTotales).toBe(8);
    expect(r.puntosATiempo).toBe(true);
  });

  it("por debajo del mínimo: solo puntos base", () => {
    const r = calcularPuntos({ ...base, tiempoInvertidoMin: 10 });
    expect(r.puntosTotales).toBe(6);
    expect(r.puntosATiempo).toBe(false);
  });

  it("excede el máximo: solo puntos base", () => {
    const r = calcularPuntos({ ...base, tiempoInvertidoMin: 120 });
    expect(r.puntosTotales).toBe(6);
    expect(r.puntosATiempo).toBe(false);
  });

  it("con dependientes: suma bonus desbloqueo", () => {
    const r = calcularPuntos({
      ...base,
      tiempoInvertidoMin: 45,
      tieneDependientes: true,
    });
    expect(r.puntosTotales).toBe(11); // 6 + 2 + 3
    expect(r.bonusDesbloqueo).toBe(true);
  });

  it("exactamente en los bordes es 'a tiempo'", () => {
    expect(calcularPuntos({ ...base, tiempoInvertidoMin: 30 }).puntosATiempo).toBe(true);
    expect(calcularPuntos({ ...base, tiempoInvertidoMin: 60 }).puntosATiempo).toBe(true);
    expect(calcularPuntos({ ...base, tiempoInvertidoMin: 29 }).puntosATiempo).toBe(false);
    expect(calcularPuntos({ ...base, tiempoInvertidoMin: 61 }).puntosATiempo).toBe(false);
  });
});

function esAyudaCruzadaValida(
  asignadoAId: string,
  ejecutadaRealmenteId: string | undefined,
): boolean {
  return (
    !!ejecutadaRealmenteId && ejecutadaRealmenteId !== asignadoAId
  );
}

describe("Validación de ayuda cruzada", () => {
  it("ejecutor distinto al asignado es ayuda cruzada", () => {
    expect(esAyudaCruzadaValida("user-a", "user-b")).toBe(true);
  });

  it("ejecutor igual al asignado NO es ayuda cruzada", () => {
    expect(esAyudaCruzadaValida("user-a", "user-a")).toBe(false);
  });

  it("sin ejecutor especificado NO es ayuda cruzada", () => {
    expect(esAyudaCruzadaValida("user-a", undefined)).toBe(false);
  });
});

function checklistCompleto(
  marcadosIds: string[],
  obligatoriosIds: string[],
): boolean {
  return obligatoriosIds.every((id) => marcadosIds.includes(id));
}

describe("Validación de checklist", () => {
  const obligatorios = ["i1", "i2", "i3"];

  it("con todos marcados: completo", () => {
    expect(checklistCompleto(["i1", "i2", "i3"], obligatorios)).toBe(true);
  });

  it("faltan items: incompleto", () => {
    expect(checklistCompleto(["i1", "i2"], obligatorios)).toBe(false);
  });

  it("items extras no obligatorios no rompen: completo", () => {
    expect(checklistCompleto(["i1", "i2", "i3", "opcional"], obligatorios)).toBe(true);
  });

  it("sin obligatorios: trivialmente completo", () => {
    expect(checklistCompleto([], [])).toBe(true);
  });
});

function horasAntesDelHito(completadaEn: Date, fechaHito: Date): number {
  return (fechaHito.getTime() - completadaEn.getTime()) / (60 * 60 * 1000);
}

describe("Cálculo de horas antes del hito (KPI CHECKLIST_48H)", () => {
  const hito = new Date("2026-05-20T14:00:00Z");

  it("tarea completada 3 días antes: ~72h (cumple 48h)", () => {
    const completada = new Date("2026-05-17T14:00:00Z");
    expect(horasAntesDelHito(completada, hito)).toBe(72);
  });

  it("tarea completada 24h antes: NO cumple 48h", () => {
    const completada = new Date("2026-05-19T14:00:00Z");
    const h = horasAntesDelHito(completada, hito);
    expect(h).toBe(24);
    expect(h >= 48).toBe(false);
  });

  it("tarea completada exactamente 48h antes: cumple", () => {
    const completada = new Date("2026-05-18T14:00:00Z");
    const h = horasAntesDelHito(completada, hito);
    expect(h).toBe(48);
    expect(h >= 48).toBe(true);
  });

  it("tarea completada después del hito: negativo", () => {
    const completada = new Date("2026-05-21T14:00:00Z");
    expect(horasAntesDelHito(completada, hito)).toBe(-24);
  });
});

function bloqueoDeDiasLargos(
  desde: Date | null,
  hasta: Date | null,
  umbralDias: number,
  referencia: Date,
): boolean {
  if (!desde) return false;
  const finEfectivo = hasta ?? referencia;
  const diffMs = finEfectivo.getTime() - desde.getTime();
  return diffMs > umbralDias * 24 * 60 * 60 * 1000;
}

describe("Detección de bloqueos prolongados", () => {
  const ref = new Date("2026-05-15T00:00:00Z");

  it("bloqueo abierto de >6 días cuenta como largo", () => {
    const desde = new Date("2026-05-08T00:00:00Z");
    expect(bloqueoDeDiasLargos(desde, null, 6, ref)).toBe(true);
  });

  it("bloqueo cerrado en 3 días no cuenta", () => {
    const desde = new Date("2026-05-10T00:00:00Z");
    const hasta = new Date("2026-05-13T00:00:00Z");
    expect(bloqueoDeDiasLargos(desde, hasta, 6, ref)).toBe(false);
  });

  it("sin bloqueo: false", () => {
    expect(bloqueoDeDiasLargos(null, null, 6, ref)).toBe(false);
  });
});
