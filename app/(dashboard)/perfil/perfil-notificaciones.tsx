"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { actualizarPreferenciasNotificaciones } from "@/lib/perfil/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const tipos = [
  { key: "certificados", label: "Certificados obtenidos" },
  { key: "subidas_nivel", label: "Subidas de nivel" },
  { key: "badges", label: "Nuevos badges" },
  { key: "objetivos", label: "Objetivos cumplidos" },
  { key: "cursos_nuevos", label: "Nuevos cursos en tu area" },
  { key: "recordatorios", label: "Recordatorios semanales" },
];

const defaults: Record<string, { app: boolean; email: boolean }> = Object.fromEntries(
  tipos.map((t) => [t.key, { app: true, email: false }])
);

export function PerfilNotificaciones({
  preferencias,
}: {
  preferencias: Record<string, { app: boolean; email: boolean }> | null;
}) {
  const [prefs, setPrefs] = useState(preferencias ?? defaults);
  const [isPending, startTransition] = useTransition();

  const toggle = (key: string, channel: "app" | "email") => {
    setPrefs((p) => ({
      ...p,
      [key]: { ...p[key], [channel]: !p[key]?.[channel] },
    }));
  };

  const guardar = () => {
    startTransition(async () => {
      await actualizarPreferenciasNotificaciones(prefs);
      toast.success("Preferencias actualizadas");
    });
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Preferencias de notificaciones</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium">Tipo</th>
              <th className="py-2 text-center font-medium w-24">En la app</th>
              <th className="py-2 text-center font-medium w-24">Por email</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo) => {
              const pref = prefs[tipo.key] ?? { app: true, email: false };
              return (
                <tr key={tipo.key} className="border-b last:border-b-0">
                  <td className="py-3">{tipo.label}</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => toggle(tipo.key, "app")}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pref.app ? "bg-primary" : "bg-muted"}`}
                      aria-label={`${tipo.label} en la app`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${pref.app ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => toggle(tipo.key, "email")}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pref.email ? "bg-primary" : "bg-muted"}`}
                      aria-label={`${tipo.label} por email`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${pref.email ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button onClick={guardar} disabled={isPending} className="mt-4">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar preferencias
      </Button>
    </Card>
  );
}
