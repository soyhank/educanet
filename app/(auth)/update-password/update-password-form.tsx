"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "../actions";

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-success" />
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button render={<Link href="/login" />}>
          Ir a iniciar sesion
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contrasena</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Actualizar contrasena
      </Button>
    </form>
  );
}
