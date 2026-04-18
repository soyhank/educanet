import { describe, it, expect } from "vitest";
import { calcularNivel, puntosParaNivel } from "@/lib/gamificacion/puntos";

describe("calcularNivel (review)", () => {
  it("0 puntos = nivel 1", () => expect(calcularNivel(0)).toBe(1));
  it("520 puntos = nivel 3", () => expect(calcularNivel(520)).toBe(3));
  it("1200 puntos = nivel 5", () => expect(calcularNivel(1200)).toBe(5));
});

describe("puntosParaNivel (review)", () => {
  it("nivel 1 = 100", () => expect(puntosParaNivel(1)).toBe(100));
  it("nivel 5 = 1118", () => expect(puntosParaNivel(5)).toBe(1118));
});
