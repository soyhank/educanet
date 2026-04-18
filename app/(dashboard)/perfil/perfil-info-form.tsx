"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { actualizarPerfil } from "@/lib/perfil/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PerfilInfoForm({
  nombre,
  apellido,
  bio,
  email,
  puestoNombre,
  areaNombre,
}: {
  nombre: string;
  apellido: string;
  bio: string | null;
  email: string;
  puestoNombre?: string | null;
  areaNombre?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm({
    defaultValues: { nombre, apellido, bio: bio ?? "" },
  });

  const onSubmit = (data: { nombre: string; apellido: string; bio: string }) => {
    startTransition(async () => {
      try {
        await actualizarPerfil(data);
        toast.success("Perfil actualizado");
      } catch {
        toast.error("Error al actualizar");
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" {...register("apellido")} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" {...register("bio")} maxLength={500} rows={3} placeholder="Cuentanos sobre ti..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
            <p className="text-xs text-muted-foreground">Para cambiar el email, contacta a RRHH</p>
          </div>
          <div className="space-y-2">
            <Label>Puesto</Label>
            <Input value={`${puestoNombre ?? "Sin puesto"} · ${areaNombre ?? "Sin area"}`} disabled />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </Card>
  );
}
