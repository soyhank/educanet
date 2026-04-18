import { describe, it, expect } from "vitest";
import { TOPES_MENSUALES } from "@/lib/gamificacion/multiplicadores";

describe("TOPES_MENSUALES", () => {
  it("APRENDIZAJE tope 400", () => {
    expect(TOPES_MENSUALES.APRENDIZAJE).toBe(400);
  });
  it("KPIS tope 1000", () => {
    expect(TOPES_MENSUALES.KPIS).toBe(1000);
  });
  it("COMPROMISOS tope 200", () => {
    expect(TOPES_MENSUALES.COMPROMISOS).toBe(200);
  });
  it("RECONOCIMIENTOS tope 200", () => {
    expect(TOPES_MENSUALES.RECONOCIMIENTOS).toBe(200);
  });
  it("MISIONES tope 200", () => {
    expect(TOPES_MENSUALES.MISIONES).toBe(200);
  });
  it("SISTEMA sin tope (Infinity)", () => {
    expect(TOPES_MENSUALES.SISTEMA).toBe(Number.POSITIVE_INFINITY);
  });
  it("Total mensual posible sin SISTEMA/EQUIPO = ~2000", () => {
    const total =
      TOPES_MENSUALES.KPIS +
      TOPES_MENSUALES.APRENDIZAJE +
      TOPES_MENSUALES.COMPROMISOS +
      TOPES_MENSUALES.RECONOCIMIENTOS +
      TOPES_MENSUALES.MISIONES;
    expect(total).toBe(2000);
  });
});
