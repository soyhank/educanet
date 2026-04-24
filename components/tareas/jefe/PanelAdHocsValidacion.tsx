"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validarTareaAdHoc } from "@/lib/tareas/actions";
import { datosTarea } from "@/lib/tareas/tarea-datos";
import type { Prisma } from "@prisma/client";

type TareaAdHoc = Prisma.TareaInstanciaGetPayload<{
  include: { catalogoTarea: true };
}>;

export function PanelAdHocsValidacion({
  tareas,
  miembroNombre,
}: {
  tareas: TareaAdHoc[];
  miembroNombre: string;
}) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Tareas ad-hoc por validar ({tareas.length})
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {miembroNombre} las completó por fuera del catálogo. Aprobá (con o sin
          ajuste de puntos) o rechazá.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tareas.map((t) => (
          <TareaAdHocItem key={t.id} tarea={t} />
        ))}
      </CardContent>
    </Card>
  );
}

function TareaAdHocItem({ tarea }: { tarea: TareaAdHoc }) {
  const router = useRouter();
  const datos = datosTarea(tarea);
  const [expand, setExpand] = useState(false);
  const [comentario, setComentario] = useState("");
  const [ajustePuntos, setAjustePuntos] = useState<string>(
    String(tarea.puntosBrutos),
  );
  const [isPending, startTransition] = useTransition();

  const validar = (aprobar: boolean) => {
    startTransition(async () => {
      const parsed = parseInt(ajustePuntos, 10);
      const ajuste = isNaN(parsed) || parsed < 0 ? undefined : parsed;
      const res = await validarTareaAdHoc({
        tareaId: tarea.id,
        aprobar,
        comentario: comentario.trim() || undefined,
        ajustePuntos: aprobar ? ajuste : undefined,
      });
      if (!res.success) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(
        aprobar
          ? `Aprobada · +${res.data?.puntosOtorgados ?? 0} pts otorgados`
          : "Rechazada",
      );
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">{datos.nombre}</p>
          {datos.descripcion && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {datos.descripcion}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              <Clock className="mr-1 h-2.5 w-2.5" />
              Reportado: {tarea.tiempoInvertidoMin ?? "?"}m (est.{" "}
              {datos.tiempoMinimoMin}-{datos.tiempoMaximoMin}m)
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {tarea.puntosBrutos} pts brutos
            </Badge>
            {tarea.puntosATiempo && (
              <Badge variant="outline" className="border-success/50 text-success text-[10px]">
                a tiempo
              </Badge>
            )}
          </div>
          {tarea.notasEjecutor && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              &ldquo;{tarea.notasEjecutor}&rdquo;
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            size="sm"
            onClick={() => (expand ? validar(true) : setExpand(true))}
            disabled={isPending}
          >
            <Check />
            {expand ? "Confirmar" : "Aprobar"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => (expand ? validar(false) : setExpand(true))}
            disabled={isPending}
          >
            <X />
            Rechazar
          </Button>
        </div>
      </div>

      {expand && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div className="space-y-1">
              <Label htmlFor={`c-${tarea.id}`} className="text-xs">
                Comentario (opcional)
              </Label>
              <Textarea
                id={`c-${tarea.id}`}
                rows={2}
                placeholder="Ej: bajé los pts porque la tarea en catálogo ya cubre el 80%"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`p-${tarea.id}`} className="text-xs">
                Ajustar pts
              </Label>
              <Input
                id={`p-${tarea.id}`}
                type="number"
                min={0}
                max={50}
                value={ajustePuntos}
                onChange={(e) => setAjustePuntos(e.target.value)}
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpand(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
