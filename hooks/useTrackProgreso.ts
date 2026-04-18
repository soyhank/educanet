"use client";

import { useRef, useState, useTransition } from "react";
import { actualizarProgresoVideo, marcarLeccionCompletada } from "@/lib/cursos/actions";

type Params = {
  leccionId: string;
  porcentajeInicial: number;
  onPuntosGanados?: (data: { puntos: number; subioNivel?: boolean; nuevoNivel?: number }) => void;
};

export function useTrackProgreso({ leccionId, porcentajeInicial, onPuntosGanados }: Params) {
  const [estado, setEstado] = useState<"idle" | "guardando" | "completada">(
    porcentajeInicial >= 100 ? "completada" : "idle"
  );
  const [, startTransition] = useTransition();
  const lastSaved = useRef(porcentajeInicial);
  const completadaRef = useRef(porcentajeInicial >= 100);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function completar() {
    if (completadaRef.current && estado === "completada") return;
    completadaRef.current = true;
    setEstado("guardando");
    startTransition(async () => {
      try {
        const res = await marcarLeccionCompletada(leccionId);
        setEstado("completada");
        if (!("error" in res) && onPuntosGanados) {
          onPuntosGanados({
            puntos: res.puntosGanados,
            subioNivel: !!res.nuevoNivel,
            nuevoNivel: res.nuevoNivel,
          });
        }
      } catch {
        setEstado("idle");
        completadaRef.current = false;
      }
    });
  }

  function actualizarProgreso(pct: number) {
    if (completadaRef.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (Math.abs(pct - lastSaved.current) < 3) return;
      lastSaved.current = pct;
      setEstado("guardando");
      startTransition(async () => {
        try {
          await actualizarProgresoVideo(leccionId, Math.round(pct));
          setEstado("idle");
        } catch {
          setEstado("idle");
        }
      });
    }, 5000);

    if (pct >= 90 && !completadaRef.current) {
      completadaRef.current = true;
      completar();
    }
  }

  return { actualizarProgreso, marcarCompletada: completar, estado };
}
