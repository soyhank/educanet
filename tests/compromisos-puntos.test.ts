import { describe, it, expect } from "vitest";
import { PUNTOS_COMPROMISO } from "@/lib/compromisos/actions";

describe("PUNTOS_COMPROMISO", () => {
  it("a tiempo validado = 25", () => {
    expect(PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO).toBe(25);
  });
  it("a tiempo auto-validado = 20", () => {
    expect(PUNTOS_COMPROMISO.A_TIEMPO_AUTO).toBe(20);
  });
  it("con retraso = 10", () => {
    expect(PUNTOS_COMPROMISO.CON_RETRASO).toBe(10);
  });
  it("no cumplido = 0", () => {
    expect(PUNTOS_COMPROMISO.NO_CUMPLIDO).toBe(0);
  });
  it("a tiempo validado suma mas que auto", () => {
    expect(PUNTOS_COMPROMISO.A_TIEMPO_VALIDADO).toBeGreaterThan(
      PUNTOS_COMPROMISO.A_TIEMPO_AUTO
    );
  });
  it("a tiempo supera con retraso", () => {
    expect(PUNTOS_COMPROMISO.A_TIEMPO_AUTO).toBeGreaterThan(
      PUNTOS_COMPROMISO.CON_RETRASO
    );
  });
});
