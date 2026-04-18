"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cambiarContrasena } from "@/lib/perfil/actions";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function PerfilSeguridad() {
  const [isPending, startTransition] = useTransition();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      toast.error("Las contrasenas no coinciden");
      return;
    }
    if (nueva.length < 8) {
      toast.error("La contrasena debe tener al menos 8 caracteres");
      return;
    }

    startTransition(async () => {
      const res = await cambiarContrasena(actual, nueva);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Contrasena actualizada");
        setActual("");
        setNueva("");
        setConfirmar("");
      }
    });
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Cambiar contrasena</h3>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="actual">Contrasena actual</Label>
          <Input id="actual" type="password" value={actual} onChange={(e) => setActual(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nueva">Nueva contrasena</Label>
          <div className="relative">
            <Input
              id="nueva"
              type={showNew ? "text" : "password"}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showNew ? "Ocultar" : "Mostrar"}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmar">Confirmar nueva contrasena</Label>
          <Input id="confirmar" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cambiar contrasena
        </Button>
      </form>
    </Card>
  );
}
