"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dispararOnboardingUsuarioAction } from "@/lib/tareas/catalogo-actions";

export function BotonOnboarding({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const disparar = () => {
    startTransition(async () => {
      const res = await dispararOnboardingUsuarioAction(userId);
      if (res.success) {
        if (res.asignadas === 0) {
          toast.info("No hay tareas de onboarding marcadas para su puesto. Márcalas en Catálogo de tareas.");
        } else {
          toast.success(`${res.asignadas} tarea${res.asignadas > 1 ? "s" : ""} de onboarding asignada${res.asignadas > 1 ? "s" : ""}`);
        }
      } else {
        toast.error(res.error ?? "Error al asignar tareas");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={disparar}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Asignar tareas de onboarding
    </Button>
  );
}
