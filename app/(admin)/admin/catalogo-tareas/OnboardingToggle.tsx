"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { toggleEsOnboardingAction } from "@/lib/tareas/catalogo-actions";
import { cn } from "@/lib/utils";

export function OnboardingToggle({
  id,
  esOnboarding,
}: {
  id: string;
  esOnboarding: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(esOnboarding);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      const res = await toggleEsOnboardingAction(id, next);
      if (!res.success) {
        setOptimistic(!next);
        toast.error("Error al actualizar");
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "h-7 w-7 p-0 rounded-full",
        optimistic
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-muted-foreground",
      )}
      aria-label={optimistic ? "Quitar onboarding" : "Marcar como onboarding"}
    >
      {optimistic ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
