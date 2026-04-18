"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Clock, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoCompromiso } from "@prisma/client";
import {
  marcarCumplido,
  eliminarCompromiso,
} from "@/lib/compromisos/actions";

type Props = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: Date;
  estado: EstadoCompromiso;
  puntosOtorgados: number;
  fechaCumplimiento: Date | null;
};

function colorUrgencia(fechaLimite: Date, estado: EstadoCompromiso) {
  if (estado !== "PENDIENTE") return "text-muted-foreground";
  const dias = Math.ceil(
    (new Date(fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (dias < 0) return "text-destructive";
  if (dias <= 1) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

export function CompromisoCard({
  id,
  titulo,
  descripcion,
  fechaLimite,
  estado,
  puntosOtorgados,
  fechaCumplimiento,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const marcar = () => {
    startTransition(async () => {
      const res = await marcarCumplido(id);
      if (res.success) toast.success("Marcado como cumplido. Esperando validacion.");
      else toast.error(res.error);
    });
  };

  const borrar = () => {
    if (!confirm("Eliminar este compromiso?")) return;
    startTransition(async () => {
      const res = await eliminarCompromiso(id);
      if (res.success) toast.success("Compromiso eliminado");
      else toast.error(res.error);
    });
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3",
        estado === "CUMPLIDO" && "border-primary/40 bg-primary/5",
        estado === "ATRASADO" && "border-destructive/40",
        estado === "NO_CUMPLIDO" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{titulo}</p>
          {descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {descripcion}
            </p>
          )}
        </div>
        {estado === "PENDIENTE" && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={borrar}
            disabled={isPending}
            aria-label="Eliminar"
            className="h-6 w-6"
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex items-center gap-1 text-xs",
            colorUrgencia(fechaLimite, estado)
          )}
        >
          <Calendar className="h-3 w-3" />
          {estado === "PENDIENTE"
            ? formatDistanceToNow(new Date(fechaLimite), {
                addSuffix: true,
                locale: es,
              })
            : format(new Date(fechaLimite), "dd MMM", { locale: es })}
        </span>

        {estado === "CUMPLIDO" && puntosOtorgados > 0 && (
          <Badge className="gap-1 bg-primary text-primary-foreground">
            <Sparkles className="h-3 w-3" />+{puntosOtorgados}
          </Badge>
        )}
      </div>

      {estado === "PENDIENTE" && (
        <Button
          size="sm"
          variant="outline"
          onClick={marcar}
          disabled={isPending}
          className="mt-2 w-full"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Marcar cumplido
        </Button>
      )}

      {estado === "CUMPLIDO_AUTO" && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Esperando validacion
        </div>
      )}
    </div>
  );
}
