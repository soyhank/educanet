"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "../actions";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-success" />
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button variant="outline" render={<Link href="/login" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesion
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@empresa.com" required />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar enlace
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Volver al inicio de sesion
        </Link>
      </p>
    </form>
  );
}
