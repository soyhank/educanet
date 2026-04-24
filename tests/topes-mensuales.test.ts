import { describe, it, expect } from "vitest";
import { TOPES_MENSUALES } from "@/lib/gamificacion/multiplicadores";

describe("TOPES_MENSUALES", () => {
  it("APRENDIZAJE tope 400", () => {
    expect(TOPES_MENSUALES.APRENDIZAJE).toBe(400);
  });
  it("KPIS tope 1000", () => {
    expect(TOPES_MENSUALES.KPIS).toBe(1000);
  });
  it("TAREAS_OPERATIVAS tope 400", () => {
    expect(TOPES_MENSUALES.TAREAS_OPERATIVAS).toBe(400);
  });
  it("COMPROMISOS tope 100 (solo iniciativas voluntarias)", () => {
    expect(TOPES_MENSUALES.COMPROMISOS).toBe(100);
  });
  it("RECONOCIMIENTOS tope 200", () => {
    expect(TOPES_MENSUALES.RECONOCIMIENTOS).toBe(200);
  });
  it("MISIONES tope 200", () => {
    expect(TOPES_MENSUALES.MISIONES).toBe(200);
  });
  it("EQUIPO tope 300", () => {
    expect(TOPES_MENSUALES.EQUIPO).toBe(300);
  });
  it("SISTEMA sin tope (Infinity)", () => {
    expect(TOPES_MENSUALES.SISTEMA).toBe(Number.POSITIVE_INFINITY);
  });
  it("TAREAS_OPERATIVAS y COMPROMISOS son independientes", () => {
    expect(TOPES_MENSUALES.TAREAS_OPERATIVAS).not.toBe(
      TOPES_MENSUALES.COMPROMISOS
    );
    expect(TOPES_MENSUALES.TAREAS_OPERATIVAS).toBeGreaterThan(
      TOPES_MENSUALES.COMPROMISOS
    );
  });
  it("Total mensual posible (excluyendo SISTEMA) = 2600", () => {
    const total =
      TOPES_MENSUALES.KPIS +
      TOPES_MENSUALES.APRENDIZAJE +
      TOPES_MENSUALES.TAREAS_OPERATIVAS +
      TOPES_MENSUALES.COMPROMISOS +
      TOPES_MENSUALES.RECONOCIMIENTOS +
      TOPES_MENSUALES.MISIONES +
      TOPES_MENSUALES.EQUIPO;
    expect(total).toBe(2600);
  });
});
