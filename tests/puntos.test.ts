import { describe, it, expect } from "vitest";
import { puntosParaNivel, calcularNivel, puntosParaSiguienteNivel } from "@/lib/gamificacion/puntos";

describe("puntosParaNivel", () => {
  it("nivel 1 requiere 100 puntos", () => {
    expect(puntosParaNivel(1)).toBe(100);
  });

  it("nivel 2 requiere ~283 puntos", () => {
    expect(puntosParaNivel(2)).toBe(283);
  });

  it("nivel 5 requiere ~1118 puntos", () => {
    expect(puntosParaNivel(5)).toBe(1118);
  });

  it("nivel 10 requiere ~3162 puntos", () => {
    expect(puntosParaNivel(10)).toBe(3162);
  });
});

describe("calcularNivel", () => {
  it("0 puntos = nivel 1", () => {
    expect(calcularNivel(0)).toBe(1);
  });

  it("100 puntos = nivel 1", () => {
    expect(calcularNivel(100)).toBe(1);
  });

  it("283 puntos = nivel 2", () => {
    expect(calcularNivel(283)).toBe(2);
  });

  it("284 puntos = nivel 2", () => {
    expect(calcularNivel(284)).toBe(2);
  });

  it("1200 puntos = nivel 5", () => {
    expect(calcularNivel(1200)).toBe(5);
  });
});

describe("puntosParaSiguienteNivel", () => {
  it("calcula progreso correctamente", () => {
    const result = puntosParaSiguienteNivel(1, 150);
    expect(result.puntosNecesarios).toBe(283);
    expect(result.puntosFaltantes).toBe(133);
    expect(result.progreso).toBeGreaterThan(0);
    expect(result.progreso).toBeLessThan(100);
  });

  it("progreso es 0 al inicio del nivel", () => {
    const result = puntosParaSiguienteNivel(1, 100);
    expect(result.progreso).toBe(0);
  });
});
