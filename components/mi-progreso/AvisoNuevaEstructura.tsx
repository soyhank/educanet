"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/primitives/GlassCard";

const STORAGE_KEY = "educanet-aviso-19a";

export function AvisoNuevaEstructura() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cerrado = localStorage.getItem(STORAGE_KEY);
    if (!cerrado) setVisible(true);
  }, []);

  const cerrar = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <GlassCard intensity="standard" className="p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm">Actualizamos cómo funcionan los puntos</h3>
          <p className="text-xs text-muted-foreground">
            Para que el sistema sea más justo y transparente:
          </p>
          <ul className="text-xs space-y-1.5 mt-1">
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Tareas operativas</span>{" "}
                (400 pts): trabajo de tu rol separado de compromisos propios
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">KPIs con 3 tipos</span>:
                auto-calculados, auto-reportados (con validación del jefe), o evaluados por tu jefe
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Rangos renombrados:{" "}
                <span className="font-medium text-foreground">Bronce → Oro → Diamante → Sideral</span>
              </span>
            </li>
          </ul>
        </div>
        <button
          onClick={cerrar}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
}
