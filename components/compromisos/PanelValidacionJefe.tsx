"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { validarCompromiso } from "@/lib/compromisos/actions";

type PendienteValidar = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: Date;
  fechaCumplimiento: Date | null;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
    puesto: { nombre: string } | null;
  };
};

export function PanelValidacionJefe({
  pendientes,
}: {
  pendientes: PendienteValidar[];
}) {
  const [rechazoAbierto, setRechazoAbierto] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [isPending, startTransition] = useTransition();

  if (pendientes.length === 0) return null;

  const aprobar = (id: string) => {
    startTransition(async () => {
      const res = await validarCompromiso({ compromisoId: id, aprobar: true });
      if (res.success) toast.success("Compromiso aprobado");
      else toast.error(res.error);
    });
  };

  const rechazar = () => {
    if (!rechazoAbierto) return;
    if (comentario.trim().length < 5) {
      toast.error("Escribe el motivo del rechazo");
      return;
    }
    startTransition(async () => {
      const res = await validarCompromiso({
        compromisoId: rechazoAbierto,
        aprobar: false,
        comentario: comentario.trim(),
      });
      if (res.success) {
        toast.success("Rechazado");
        setRechazoAbierto(null);
        setComentario("");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <section className="rounded-xl border border-amber-300/40 bg-amber-50/40 p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
      <h3 className="text-base font-semibold">
        Compromisos de tu equipo por validar
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {pendientes.length} pendiente{pendientes.length === 1 ? "" : "s"} ·
        Si no validas en 7 dias, se auto-aprueban.
      </p>

      <div className="mt-4 space-y-3">
        {pendientes.map((c) => {
          const aTiempo =
            c.fechaCumplimiento &&
            c.fechaCumplimiento.getTime() <= c.fechaLimite.getTime();
          return (
            <div
              key={c.id}
              className="flex items-start gap-3 rounded-lg border bg-background p-3"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                {c.user.avatarUrl && <AvatarImage src={c.user.avatarUrl} alt="" />}
                <AvatarFallback className="text-xs">
                  {c.user.nombre[0]}
                  {c.user.apellido[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {c.user.nombre} {c.user.apellido}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    · {c.user.puesto?.nombre ?? ""}
                  </span>
                </p>
                <p className="text-sm text-foreground">{c.titulo}</p>
                {c.descripcion && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {c.descripcion}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Limite: {format(c.fechaLimite, "dd MMM", { locale: es })}{" "}
                  · Marcado{" "}
                  {c.fechaCumplimiento &&
                    formatDistanceToNow(c.fechaCumplimiento, {
                      addSuffix: true,
                      locale: es,
                    })}
                  {" · "}
                  {aTiempo ? (
                    <span className="text-primary">A tiempo</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Con retraso
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={() => aprobar(c.id)}
                  disabled={isPending}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRechazoAbierto(c.id)}
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
        open={!!rechazoAbierto}
        onOpenChange={(v) => {
          if (!v) {
            setRechazoAbierto(null);
            setComentario("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar compromiso</DialogTitle>
          </DialogHeader>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Motivo del rechazo (minimo 5 caracteres)"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRechazoAbierto(null);
                setComentario("");
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
