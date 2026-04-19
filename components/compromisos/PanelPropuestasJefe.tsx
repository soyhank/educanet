"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  aprobarPropuestaCompromiso,
  rechazarPropuestaCompromiso,
} from "@/lib/compromisos/actions";

type Propuesta = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: Date;
  createdAt: Date;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
    puesto: { nombre: string } | null;
  };
};

export function PanelPropuestasJefe({
  propuestas,
}: {
  propuestas: Propuesta[];
}) {
  const [rechazarId, setRechazarId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [isPending, startTransition] = useTransition();

  if (propuestas.length === 0) return null;

  const aprobar = (id: string) => {
    startTransition(async () => {
      const res = await aprobarPropuestaCompromiso(id);
      if (res.success) toast.success("Propuesta aprobada");
      else toast.error(res.error);
    });
  };

  const rechazar = () => {
    if (!rechazarId) return;
    if (motivo.trim().length < 5) {
      toast.error("Escribe el motivo (minimo 5 caracteres)");
      return;
    }
    startTransition(async () => {
      const res = await rechazarPropuestaCompromiso({
        compromisoId: rechazarId,
        motivo: motivo.trim(),
      });
      if (res.success) {
        toast.success("Propuesta rechazada");
        setRechazarId(null);
        setMotivo("");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <section className="rounded-xl border border-amber-300/40 bg-amber-50/40 p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        Propuestas del equipo por aprobar
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {propuestas.length} propuesta{propuestas.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4 space-y-3">
        {propuestas.map((p) => {
          const iniciales = `${p.user.nombre[0] ?? ""}${p.user.apellido[0] ?? ""}`.toUpperCase();
          return (
            <div
              key={p.id}
              className="flex items-start gap-3 rounded-lg border bg-background p-3"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                {p.user.avatarUrl && <AvatarImage src={p.user.avatarUrl} alt="" />}
                <AvatarFallback className="text-xs">{iniciales}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {p.user.nombre} {p.user.apellido}
                </p>
                <p className="text-sm text-foreground">{p.titulo}</p>
                {p.descripcion && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {p.descripcion}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Entregable: {format(p.fechaLimite, "dd MMM", { locale: es })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={() => aprobar(p.id)}
                  disabled={isPending}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRechazarId(p.id)}
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!rechazarId}
        onOpenChange={(v) => {
          if (!v) {
            setRechazarId(null);
            setMotivo("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar propuesta</DialogTitle>
          </DialogHeader>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo del rechazo (minimo 5 caracteres)"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRechazarId(null);
                setMotivo("");
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={rechazar}
              disabled={isPending}
            >
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
