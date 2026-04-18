"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reportarKpiSemanal } from "@/lib/kpis/actions";

export function FormReporteSemanal({
  asignacionId,
  unidad,
  semanaActual,
  anio,
  valorExistente,
  comentarioExistente,
}: {
  asignacionId: string;
  unidad: string;
  semanaActual: number;
  anio: number;
  valorExistente: number | null;
  comentarioExistente: string | null;
}) {
  const [editando, setEditando] = useState(valorExistente === null);
  const [valor, setValor] = useState(
    valorExistente !== null ? String(valorExistente) : ""
  );
  const [comentario, setComentario] = useState(comentarioExistente ?? "");
  const [isPending, startTransition] = useTransition();

  const guardar = () => {
    const num = Number(valor);
    if (!Number.isFinite(num)) {
      toast.error("Valor numerico invalido");
      return;
    }
    startTransition(async () => {
      const res = await reportarKpiSemanal({
        asignacionId,
        valor: num,
        comentario: comentario || undefined,
        semanaDelAnio: semanaActual,
        anio,
      });
      if (res.success) {
        toast.success("Valor reportado");
        setEditando(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  if (!editando && valorExistente !== null) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">
            Semana {semanaActual} ya reportada
          </p>
          <p className="font-medium">
            {valorExistente} {unidad}
          </p>
          {comentarioExistente && (
            <p className="mt-1 text-xs text-muted-foreground">
              {comentarioExistente}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditando(true)}
          className="text-xs"
        >
          <Pencil className="mr-1 h-3 w-3" />
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Reportar valor de semana {semanaActual}
      </p>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div>
          <Label className="text-xs" htmlFor={`valor-${asignacionId}`}>
            Valor ({unidad})
          </Label>
          <Input
            id={`valor-${asignacionId}`}
            type="number"
            step="any"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs" htmlFor={`coment-${asignacionId}`}>
            Comentario (opcional)
          </Label>
          <Textarea
            id={`coment-${asignacionId}`}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={1}
            className="mt-1 resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {valorExistente !== null && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditando(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
        )}
        <Button size="sm" onClick={guardar} disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
