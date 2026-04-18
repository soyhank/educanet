"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { crearReconocimiento } from "@/lib/reconocimientos/actions";

type Companero = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  puesto: { nombre: string } | null;
};

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string | null;
  color: string;
};

export function ModalNuevaNominacion({
  abierto,
  onCerrar,
  companeros,
  categorias,
}: {
  abierto: boolean;
  onCerrar: () => void;
  companeros: Companero[];
  categorias: Categoria[];
}) {
  const [email, setEmail] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [visibilidad, setVisibilidad] = useState<"PUBLICO" | "PRIVADO">("PUBLICO");
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setEmail("");
    setCategoriaId("");
    setMensaje("");
    setVisibilidad("PUBLICO");
  };

  const enviar = () => {
    if (!email || !categoriaId || mensaje.trim().length < 20) {
      toast.error("Completa todos los campos (mensaje minimo 20 caracteres)");
      return;
    }
    startTransition(async () => {
      const res = await crearReconocimiento({
        reconocidoEmail: email,
        categoriaId,
        mensaje: mensaje.trim(),
        visibilidad,
      });
      if (res.success) {
        toast.success("Reconocimiento enviado");
        reset();
        onCerrar();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            Reconocer a un compañero
          </DialogTitle>
          <DialogDescription>
            Los mensajes especificos motivan mas que los genericos. Cuenta que
            hizo bien.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Persona</Label>
            <Select value={email} onValueChange={(v) => setEmail(v ?? "")}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un compañero" />
              </SelectTrigger>
              <SelectContent>
                {companeros.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    No hay compañeros en tu area.
                  </div>
                ) : (
                  companeros.map((c) => (
                    <SelectItem key={c.id} value={c.email}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt="" />}
                          <AvatarFallback className="text-[10px]">
                            {c.nombre[0]}
                            {c.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {c.nombre} {c.apellido}
                        </span>
                        {c.puesto && (
                          <span className="text-xs text-muted-foreground">
                            · {c.puesto.nombre}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Categoria</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {categorias.map((c) => {
                const activa = categoriaId === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategoriaId(c.id)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-2 text-left transition-all",
                      activa
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{c.nombre}</p>
                      <p className="line-clamp-2 text-[10px] text-muted-foreground">
                        {c.descripcion}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs">Mensaje</Label>
            <Textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ejemplo: La semana pasada me ayudo a rediseñar el pitch del cliente X fuera de su horario. La pieza final quedo impresionante."
              maxLength={500}
              rows={4}
              className="mt-1 resize-none"
            />
            <p className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Minimo 20 caracteres</span>
              <span
                className={cn(
                  "tabular-nums",
                  mensaje.length >= 20
                    ? "text-muted-foreground"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {mensaje.length}/500
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={visibilidad === "PUBLICO"}
                onChange={() => setVisibilidad("PUBLICO")}
              />
              <span>Publico (todo el equipo lo ve)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={visibilidad === "PRIVADO"}
                onChange={() => setVisibilidad("PRIVADO")}
              />
              <span>Privado</span>
            </label>
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
          <Button onClick={enviar} disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar reconocimiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
