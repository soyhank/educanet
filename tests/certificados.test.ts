import { describe, it, expect } from "vitest";

// Test the code generation logic in isolation
const CARACTERES = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generarCodigoVerificacion(): string {
  const bloque = () =>
    Array.from(
      { length: 4 },
      () => CARACTERES[Math.floor(Math.random() * CARACTERES.length)]
    ).join("");
  return `EDU-${bloque()}-${bloque()}-${bloque()}`;
}

describe("generarCodigoVerificacion", () => {
  it("genera codigo con formato EDU-XXXX-XXXX-XXXX", () => {
    const codigo = generarCodigoVerificacion();
    expect(codigo).toMatch(/^EDU-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("no incluye caracteres ambiguos (0, 1, I, L, O)", () => {
    const ambiguos = ["0", "1", "I", "L", "O"];
    for (let i = 0; i < 100; i++) {
      const codigo = generarCodigoVerificacion();
      const sinPrefijo = codigo.replace("EDU-", "").replace(/-/g, "");
      for (const c of sinPrefijo) {
        expect(ambiguos).not.toContain(c);
      }
    }
  });

  it("genera codigos unicos", () => {
    const codigos = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codigos.add(generarCodigoVerificacion());
    }
    expect(codigos.size).toBe(100);
  });
});

describe("normalizacion de codigos", () => {
  it("normaliza a mayusculas y sin espacios", () => {
    const input = " edu-abcd-efgh-jklm ";
    const normalizado = input.trim().toUpperCase();
    expect(normalizado).toBe("EDU-ABCD-EFGH-JKLM");
  });
});
