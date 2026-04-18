import { describe, it, expect } from "vitest";
import { startOfDay, differenceInDays } from "date-fns";

// Test the racha logic in isolation (without DB)
function calcularRacha(
  rachaActual: number,
  ultimaActividad: Date | null,
  ahora: Date
): { nuevaRacha: number; cambio: string } {
  const hoy = startOfDay(ahora);
  const ultima = ultimaActividad ? startOfDay(ultimaActividad) : null;

  if (!ultima) return { nuevaRacha: 1, cambio: "primera" };

  const diffDias = differenceInDays(hoy, ultima);
  if (diffDias === 0) return { nuevaRacha: rachaActual, cambio: "mantenida" };
  if (diffDias === 1) return { nuevaRacha: rachaActual + 1, cambio: "incrementada" };
  return { nuevaRacha: 1, cambio: "reiniciada" };
}

describe("calcularRacha", () => {
  const hoy = new Date("2026-04-18T14:00:00Z");

  it("primera actividad → racha 1", () => {
    const r = calcularRacha(0, null, hoy);
    expect(r.nuevaRacha).toBe(1);
    expect(r.cambio).toBe("primera");
  });

  it("misma fecha → mantenida", () => {
    const r = calcularRacha(5, new Date("2026-04-18T08:00:00Z"), hoy);
    expect(r.nuevaRacha).toBe(5);
    expect(r.cambio).toBe("mantenida");
  });

  it("dia siguiente → +1", () => {
    const r = calcularRacha(5, new Date("2026-04-17T20:00:00Z"), hoy);
    expect(r.nuevaRacha).toBe(6);
    expect(r.cambio).toBe("incrementada");
  });

  it("2 dias despues → reiniciada", () => {
    const r = calcularRacha(10, new Date("2026-04-15T12:00:00Z"), hoy);
    expect(r.nuevaRacha).toBe(1);
    expect(r.cambio).toBe("reiniciada");
  });
});
