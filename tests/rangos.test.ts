import { describe, it, expect } from "vitest";
import {
  rangoSegunPuntos,
  proyeccionRango,
  siguienteRango,
  UMBRALES_RANGO,
} from "@/lib/gamificacion/rangos";

describe("rangoSegunPuntos", () => {
  it("0 pts = BRONCE", () => {
    expect(rangoSegunPuntos(0)).toBe("BRONCE");
  });

  it("799 pts = BRONCE (limite inferior de ORO es 800 inclusive)", () => {
    expect(rangoSegunPuntos(799)).toBe("BRONCE");
  });

  it("800 pts = ORO", () => {
    expect(rangoSegunPuntos(800)).toBe("ORO");
  });

  it("1399 pts = ORO", () => {
    expect(rangoSegunPuntos(1399)).toBe("ORO");
  });

  it("1400 pts = DIAMANTE", () => {
    expect(rangoSegunPuntos(1400)).toBe("DIAMANTE");
  });

  it("1799 pts = DIAMANTE", () => {
    expect(rangoSegunPuntos(1799)).toBe("DIAMANTE");
  });

  it("1800 pts = SIDERAL", () => {
    expect(rangoSegunPuntos(1800)).toBe("SIDERAL");
  });

  it("3000 pts = SIDERAL", () => {
    expect(rangoSegunPuntos(3000)).toBe("SIDERAL");
  });
});

describe("siguienteRango", () => {
  it("BRONCE -> ORO", () => {
    expect(siguienteRango("BRONCE")).toBe("ORO");
  });
  it("ORO -> DIAMANTE", () => {
    expect(siguienteRango("ORO")).toBe("DIAMANTE");
  });
  it("DIAMANTE -> SIDERAL", () => {
    expect(siguienteRango("DIAMANTE")).toBe("SIDERAL");
  });
  it("SIDERAL -> null", () => {
    expect(siguienteRango("SIDERAL")).toBeNull();
  });
});

describe("proyeccionRango", () => {
  it("calcula puntos al siguiente rango", () => {
    const r = proyeccionRango(500);
    expect(r.rangoActual).toBe("BRONCE");
    expect(r.siguiente).toBe("ORO");
    expect(r.puntosParaSiguiente).toBe(300);
    expect(r.porcentajeAlSiguiente).toBeCloseTo((500 / 800) * 100);
  });

  it("en SIDERAL retorna 0 faltantes y 100%", () => {
    const r = proyeccionRango(2000);
    expect(r.rangoActual).toBe("SIDERAL");
    expect(r.siguiente).toBeNull();
    expect(r.puntosParaSiguiente).toBe(0);
    expect(r.porcentajeAlSiguiente).toBe(100);
  });
});

describe("UMBRALES_RANGO", () => {
  it("cubre los 4 rangos en orden ascendente", () => {
    expect(Object.keys(UMBRALES_RANGO)).toEqual([
      "BRONCE",
      "ORO",
      "DIAMANTE",
      "SIDERAL",
    ]);
  });

  it("SIDERAL no tiene limite superior", () => {
    expect(UMBRALES_RANGO.SIDERAL.max).toBe(Infinity);
  });
});
