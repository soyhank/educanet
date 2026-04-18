import { describe, it, expect } from "vitest";
import { reconocimientoSchema } from "@/lib/reconocimientos/schemas";

const base = {
  reconocidoEmail: "ana@educanet.local",
  categoriaId: "cld0000000000000000000000",
  mensaje: "Me ayudo fuera de horario con el pitch del cliente importante",
  visibilidad: "PUBLICO" as const,
};

describe("reconocimientoSchema", () => {
  it("acepta un mensaje valido de 20+ caracteres", () => {
    expect(reconocimientoSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza mensaje menor a 20 caracteres", () => {
    const r = reconocimientoSchema.safeParse({
      ...base,
      mensaje: "Gracias!",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza mensaje de solo espacios", () => {
    const r = reconocimientoSchema.safeParse({
      ...base,
      mensaje: "                         ",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza email invalido", () => {
    const r = reconocimientoSchema.safeParse({
      ...base,
      reconocidoEmail: "no-es-email",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza mensaje mayor a 500", () => {
    const r = reconocimientoSchema.safeParse({
      ...base,
      mensaje: "a".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("visibilidad default PUBLICO", () => {
    const r = reconocimientoSchema.safeParse({
      reconocidoEmail: base.reconocidoEmail,
      categoriaId: base.categoriaId,
      mensaje: base.mensaje,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.visibilidad).toBe("PUBLICO");
  });
});
