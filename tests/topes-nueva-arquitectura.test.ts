import { describe, it, expect } from "vitest";
import { TOPES_MENSUALES } from "@/lib/gamificacion/multiplicadores";
import { TOPE_MENSUAL_TAREAS_OPERATIVAS } from "@/lib/tareas/tarea-datos";

describe("Topes nueva arquitectura (P19A)", () => {
  it("TAREAS_OPERATIVAS tope 400", () => {
    expect(TOPES_MENSUALES.TAREAS_OPERATIVAS).toBe(400);
  });

  it("COMPROMISOS tope 100 — independiente de TAREAS_OPERATIVAS", () => {
    expect(TOPES_MENSUALES.COMPROMISOS).toBe(100);
  });

  it("TAREAS_OPERATIVAS y COMPROMISOS son independientes: sumar sus topes no excede el monto permitido", () => {
    const combinado =
      TOPES_MENSUALES.TAREAS_OPERATIVAS + TOPES_MENSUALES.COMPROMISOS;
    expect(combinado).toBe(500); // 400 + 100
  });

  it("TOPE_MENSUAL_TAREAS_OPERATIVAS (helpers) coincide con TOPES_MENSUALES", () => {
    expect(TOPE_MENSUAL_TAREAS_OPERATIVAS).toBe(
      TOPES_MENSUALES.TAREAS_OPERATIVAS
    );
  });

  it("Total máximo del mes = 2600", () => {
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
