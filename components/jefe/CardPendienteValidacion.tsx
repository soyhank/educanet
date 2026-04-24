"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/primitives/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validarRegistroKpi } from "@/lib/kpis/actions";

type RegistroConContexto = {
  id: string;
  valor: number;
  comentario: string | null;
  createdAt: Date;
  asignacion: {
    valorObjetivo: number;
    user: { nombre: string; apellido: string };
    definicion: { nombre: string; unidad: string | null; descripcion: string };
  };
};

export function CardPendienteValidacion({
  registro,
}: {
  registro: RegistroConContexto;
}) {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [comentario, setComentario] = useState("");
  const [valorAjustado, setValorAjustado] = useState(String(registro.valor));
  const [isPending, startTransition] = useTransition();

  const diasAtras = Math.floor(
    (Date.now() - new Date(registro.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const onValidar = (aprobar: boolean) => {
    if (!aprobar && !comentario.trim()) {
      toast.error("Escribe un motivo para rechazar");
      return;
    }

    const valorNum = parseFloat(valorAjustado);
    startTransition(async () => {
      const res = await validarRegistroKpi({
        registroId: registro.id,
        aprobar,
        comentario: comentario || undefined,
        valorCorregido:
          aprobar && valorNum !== registro.valor ? valorNum : undefined,
      });

      if (res.success) {
        toast.success(aprobar ? "KPI validado" : "KPI rechazado");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {registro.asignacion.user.nombre[0]}
          {registro.asignacion.user.apellido[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-sm">
              {registro.asignacion.user.nombre}{" "}
              {registro.asignacion.user.apellido}
            </span>
            {diasAtras >= 3 && (
              <span className="text-xs text-amber-500">
                hace {diasAtras} {diasAtras === 1 ? "día" : "días"}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground mb-1">
            {registro.asignacion.definicion.nombre}
          </p>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-semibold tabular-nums">
              {registro.valor}
            </span>
            <span className="text-sm text-muted-foreground">
              {registro.asignacion.definicion.unidad}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              Meta: {registro.asignacion.valorObjetivo}
            </span>
          </div>

          {registro.comentario && (
            <div className="text-xs text-muted-foreground italic mb-3 pl-3 border-l-2 border-border">
              &ldquo;{registro.comentario}&rdquo;
            </div>
          )}

          {mostrarDetalle && (
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Ajustar valor (opcional)
                </label>
                <Input
                  type="number"
                  value={valorAjustado}
                  onChange={(e) => setValorAjustado(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Comentario (obligatorio para rechazar)
                </label>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!mostrarDetalle ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onValidar(true)}
                  disabled={isPending}
                >
                  ✓ Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMostrarDetalle(true)}
                  disabled={isPending}
                >
                  Revisar
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => onValidar(true)}
                  disabled={isPending}
                >
                  Aprobar{" "}
                  {parseFloat(valorAjustado) !== registro.valor
                    ? "con ajuste"
                    : ""}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onValidar(false)}
                  disabled={isPending || !comentario.trim()}
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMostrarDetalle(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
