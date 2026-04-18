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

  it("799 pts = BRONCE (limite inferior de PLATA es 800 inclusive)", () => {
    expect(rangoSegunPuntos(799)).toBe("BRONCE");
  });

  it("800 pts = PLATA", () => {
    expect(rangoSegunPuntos(800)).toBe("PLATA");
  });

  it("1399 pts = PLATA", () => {
    expect(rangoSegunPuntos(1399)).toBe("PLATA");
  });

  it("1400 pts = ORO", () => {
    expect(rangoSegunPuntos(1400)).toBe("ORO");
  });

  it("1799 pts = ORO", () => {
    expect(rangoSegunPuntos(1799)).toBe("ORO");
  });

  it("1800 pts = DIAMANTE", () => {
    expect(rangoSegunPuntos(1800)).toBe("DIAMANTE");
  });

  it("3000 pts = DIAMANTE", () => {
    expect(rangoSegunPuntos(3000)).toBe("DIAMANTE");
  });
});

describe("siguienteRango", () => {
  it("BRONCE -> PLATA", () => {
    expect(siguienteRango("BRONCE")).toBe("PLATA");
  });
  it("DIAMANTE -> null", () => {
    expect(siguienteRango("DIAMANTE")).toBeNull();
  });
});

describe("proyeccionRango", () => {
  it("calcula puntos al siguiente rango", () => {
    const r = proyeccionRango(500);
    expect(r.rangoActual).toBe("BRONCE");
    expect(r.siguiente).toBe("PLATA");
    expect(r.puntosParaSiguiente).toBe(300);
    expect(r.porcentajeAlSiguiente).toBeCloseTo((500 / 800) * 100);
  });

  it("en DIAMANTE retorna 0 faltantes y 100%", () => {
    const r = proyeccionRango(2000);
    expect(r.rangoActual).toBe("DIAMANTE");
    expect(r.siguiente).toBeNull();
    expect(r.puntosParaSiguiente).toBe(0);
    expect(r.porcentajeAlSiguiente).toBe(100);
  });
});

describe("UMBRALES_RANGO", () => {
  it("cubre los 4 rangos", () => {
    expect(Object.keys(UMBRALES_RANGO)).toEqual([
      "BRONCE",
      "PLATA",
      "ORO",
      "DIAMANTE",
    ]);
  });
});
