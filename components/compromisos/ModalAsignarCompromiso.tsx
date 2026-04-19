"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { asignarCompromisoAMiembro } from "@/lib/compromisos/actions";

function fechaDefault(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ModalAsignarCompromiso({
  abierto,
  onCerrar,
  miembro,
}: {
  abierto: boolean;
  onCerrar: () => void;
  miembro: { id: string; nombre: string; apellido: string } | null;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(fechaDefault());
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setTitulo("");
    setDescripcion("");
    setFecha(fechaDefault());
  };

  const guardar = () => {
    if (!miembro) return;
    if (titulo.trim().length < 5) {
      toast.error("Titulo minimo 5 caracteres");
      return;
    }
    startTransition(async () => {
      const res = await asignarCompromisoAMiembro({
        userId: miembro.id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaLimite: new Date(fecha).toISOString(),
      });
      if (res.success) {
        toast.success(`Compromiso asignado a ${miembro.nombre}`);
        reset();
        onCerrar();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog
      open={abierto && !!miembro}
      onOpenChange={(v) => !v && onCerrar()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Asignar compromiso
          </DialogTitle>
          <DialogDescription>
            {miembro
              ? `Para ${miembro.nombre} ${miembro.apellido}. Recibira notificacion al guardarlo.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Titulo</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Revisar campana de performance"
              maxLength={200}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Descripcion (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 resize-none"
            />
          </div>
          <div>
            <Label className="text-xs">Fecha limite</Label>
            <Input
              type="date"
              value={fecha}
              min={hoy()}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onCerrar();
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={isPending}>
            {isPending ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
