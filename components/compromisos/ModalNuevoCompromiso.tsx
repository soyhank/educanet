"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { crearCompromiso } from "@/lib/compromisos/actions";

function fechaDefault(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ModalNuevoCompromiso({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
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
    if (titulo.trim().length < 5) {
      toast.error("Titulo minimo 5 caracteres");
      return;
    }
    startTransition(async () => {
      const res = await crearCompromiso({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaLimite: new Date(fecha).toISOString(),
      });
      if (res.success) {
        toast.success("Compromiso creado");
        reset();
        onCerrar();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Nuevo compromiso
          </DialogTitle>
          <DialogDescription>
            Declara que vas a entregar y cuando. Cuando lo cumplas, te damos
            puntos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs" htmlFor="titulo">
              Titulo
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Entregar draft de newsletter del viernes"
              maxLength={200}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs" htmlFor="descripcion">
              Descripcion (opcional)
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 resize-none"
            />
          </div>
          <div>
            <Label className="text-xs" htmlFor="fecha">
              Fecha limite
            </Label>
            <Input
              id="fecha"
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
            {isPending ? "Guardando..." : "Crear compromiso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
