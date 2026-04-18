"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { actualizarUsuario, actualizarRolUsuario } from "@/lib/admin/usuarios-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Area, Puesto, RolUsuario } from "@prisma/client";

type Props = {
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    puestoId: string | null;
    areaId: string | null;
    activo: boolean;
  };
  areas: Area[];
  puestos: (Puesto & { area: { nombre: string } | null })[];
};

export function UsuarioInfoForm({ usuario, puestos }: Props) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    },
  });

  const onSubmit = (data: { nombre: string; apellido: string }) => {
    startTransition(async () => {
      try {
        await actualizarUsuario(usuario.id, data);
        toast.success("Usuario actualizado");
      } catch {
        toast.error("Error al actualizar");
      }
    });
  };

  const handleRol = (rol: string | null) => {
    if (!rol) return;
    startTransition(async () => {
      try {
        await actualizarRolUsuario(usuario.id, rol as RolUsuario);
        toast.success("Rol actualizado");
      } catch {
        toast.error("Error al actualizar rol");
      }
    });
  };

  const handlePuesto = (puestoId: string | null) => {
    if (!puestoId) return;
    const puesto = puestos.find((p) => p.id === puestoId);
    startTransition(async () => {
      try {
        await actualizarUsuario(usuario.id, {
          puestoId: puestoId === "none" ? null : puestoId,
          areaId: puesto?.areaId ?? null,
        });
        toast.success("Puesto actualizado");
      } catch {
        toast.error("Error al actualizar puesto");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Datos personales</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register("apellido")} />
            </div>
          </div>
          <Button type="submit" disabled={isPending} size="sm">
            {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Rol y puesto</h3>

        <div className="space-y-2">
          <Label>Rol</Label>
          <Select defaultValue={usuario.rol} onValueChange={handleRol}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRABAJADOR">Trabajador</SelectItem>
              <SelectItem value="RRHH">RRHH</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Puesto</Label>
          <Select defaultValue={usuario.puestoId ?? "none"} onValueChange={handlePuesto}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin puesto</SelectItem>
              {puestos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre} ({p.area?.nombre ?? "Sin area"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}
