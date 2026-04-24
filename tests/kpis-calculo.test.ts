import { describe, it, expect } from "vitest";
import {
  consolidarRegistros,
  calcularCumplimientoIndividual,
} from "@/lib/kpis/calculo";

function reg(semana: number, valor: number) {
  return {
    id: `r${semana}`,
    asignacionId: "a1",
    semanaDelAnio: semana,
    anio: 2026,
    valor,
    comentario: null,
    reportadoPorId: "u1",
    estadoValidacion: "VALIDADO" as const,
    validadoPorId: null,
    validadoEn: null,
    comentarioValidacion: null,
    rechazoMotivo: null,
    calculoAutomatico: false,
    snapshotDataFuente: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("consolidarRegistros", () => {
  it("ABSOLUTA: promedio", () => {
    const res = consolidarRegistros(
      [reg(1, 80), reg(2, 90), reg(3, 100)],
      "ABSOLUTA"
    );
    expect(res).toBe(90);
  });

  it("RELATIVA_BASELINE: promedio", () => {
    const res = consolidarRegistros(
      [reg(1, 100), reg(2, 110)],
      "RELATIVA_BASELINE"
    );
    expect(res).toBe(105);
  });

  it("BINARIA: proporcion de semanas cumplidas", () => {
    const res = consolidarRegistros(
      [reg(1, 1), reg(2, 0), reg(3, 1), reg(4, 1)],
      "BINARIA"
    );
    expect(res).toBe(0.75);
  });

  it("sin registros retorna 0", () => {
    expect(consolidarRegistros([], "ABSOLUTA")).toBe(0);
  });
});

describe("calcularCumplimientoIndividual", () => {
  it("cumple la meta al 100% cuando actual=objetivo", () => {
    expect(calcularCumplimientoIndividual(95, 95, "ABSOLUTA")).toBe(100);
  });

  it("cap maximo en 130%", () => {
    expect(calcularCumplimientoIndividual(200, 100, "ABSOLUTA")).toBe(130);
  });

  it("BINARIA: 100 si cumple", () => {
    expect(calcularCumplimientoIndividual(1, 1, "BINARIA")).toBe(100);
  });

  it("BINARIA: 0 si no cumple", () => {
    expect(calcularCumplimientoIndividual(0, 1, "BINARIA")).toBe(0);
  });

  it("objetivo 0 retorna 100 si actual >= 0", () => {
    expect(calcularCumplimientoIndividual(0, 0, "ABSOLUTA")).toBe(100);
  });
});
