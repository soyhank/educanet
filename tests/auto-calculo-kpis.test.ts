import { describe, it, expect } from "vitest";
import { ejecutarCalculoAutomatico } from "@/lib/kpis/auto-calculos";

describe("ejecutarCalculoAutomatico", () => {
  it("lanza error si la función no existe", async () => {
    await expect(
      ejecutarCalculoAutomatico({
        funcionNombre: "funcionQueNoExiste",
        userId: "u1",
        mes: 4,
        anio: 2026,
      })
    ).rejects.toThrow("funcionQueNoExiste");
  });

  it("funciones placeholder retornan valor 0 y snapshot con pendienteImplementacion", async () => {
    const resultado = await ejecutarCalculoAutomatico({
      funcionNombre: "calcularKpiPuntualidadPublicacion",
      userId: "u1",
      mes: 4,
      anio: 2026,
    });
    expect(resultado.valor).toBe(0);
    expect(resultado.snapshot).toMatchObject({ pendienteImplementacion: true });
  });

  it("snapshot se guarda como objeto con propiedades", async () => {
    const resultado = await ejecutarCalculoAutomatico({
      funcionNombre: "calcularKpiReportesSemanales",
      userId: "u1",
      mes: 4,
      anio: 2026,
    });
    expect(typeof resultado.snapshot).toBe("object");
    expect(resultado.snapshot).not.toBeNull();
  });
});
