/**
 * Tests de lógica de validación de KPIs.
 * No requieren DB — testean lógica pura.
 */
import { describe, it, expect } from "vitest";
import type { EstadoValidacionKpi, TipoFuenteKpi } from "@prisma/client";

// ─── Reglas de negocio ──────────────────────────────────────────────

function puedeEmpleadoReportar(tipoFuente: TipoFuenteKpi): boolean {
  return tipoFuente === "AUTO_REPORTADO";
}

function puedeJefeReportar(tipoFuente: TipoFuenteKpi): boolean {
  return tipoFuente === "EVALUADO_POR_JEFE";
}

function contarParaCumplimiento(estado: EstadoValidacionKpi): boolean {
  return estado === "VALIDADO" || estado === "AUTO_VALIDADO";
}

function estadoTrasFuso(aprobar: boolean): EstadoValidacionKpi {
  return aprobar ? "VALIDADO" : "RECHAZADO";
}

function estadoTrasCronAutoCalculo(): EstadoValidacionKpi {
  return "AUTO_VALIDADO";
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("Reglas de reporteo por tipo", () => {
  it("empleado puede reportar AUTO_REPORTADO", () => {
    expect(puedeEmpleadoReportar("AUTO_REPORTADO")).toBe(true);
  });

  it("empleado NO puede reportar EVALUADO_POR_JEFE", () => {
    expect(puedeEmpleadoReportar("EVALUADO_POR_JEFE")).toBe(false);
  });

  it("empleado NO puede reportar AUTO_CALCULADO", () => {
    expect(puedeEmpleadoReportar("AUTO_CALCULADO")).toBe(false);
  });

  it("jefe puede reportar EVALUADO_POR_JEFE", () => {
    expect(puedeJefeReportar("EVALUADO_POR_JEFE")).toBe(true);
  });

  it("jefe NO puede reportar AUTO_REPORTADO de un empleado", () => {
    expect(puedeJefeReportar("AUTO_REPORTADO")).toBe(false);
  });
});

describe("Flujo de validación", () => {
  it("registro reportado queda en PENDIENTE", () => {
    const estadoInicial: EstadoValidacionKpi = "PENDIENTE";
    expect(contarParaCumplimiento(estadoInicial)).toBe(false);
  });

  it("jefe aprueba → VALIDADO y cuenta para cumplimiento", () => {
    const estado = estadoTrasFuso(true);
    expect(estado).toBe("VALIDADO");
    expect(contarParaCumplimiento(estado)).toBe(true);
  });

  it("jefe rechaza → RECHAZADO y NO cuenta para cumplimiento", () => {
    const estado = estadoTrasFuso(false);
    expect(estado).toBe("RECHAZADO");
    expect(contarParaCumplimiento(estado)).toBe(false);
  });

  it("auto-calculado → AUTO_VALIDADO y cuenta para cumplimiento", () => {
    const estado = estadoTrasCronAutoCalculo();
    expect(estado).toBe("AUTO_VALIDADO");
    expect(contarParaCumplimiento(estado)).toBe(true);
  });
});

describe("Conteo para cumplimiento", () => {
  it("VALIDADO cuenta", () => {
    expect(contarParaCumplimiento("VALIDADO")).toBe(true);
  });

  it("AUTO_VALIDADO cuenta", () => {
    expect(contarParaCumplimiento("AUTO_VALIDADO")).toBe(true);
  });

  it("PENDIENTE no cuenta", () => {
    expect(contarParaCumplimiento("PENDIENTE")).toBe(false);
  });

  it("RECHAZADO no cuenta", () => {
    expect(contarParaCumplimiento("RECHAZADO")).toBe(false);
  });
});
