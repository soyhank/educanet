"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/primitives/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reportarKpiPorJefe } from "@/lib/kpis/actions";
import { getSemanaISO } from "@/lib/gamificacion/periodo";
import type { KpiRegistroSemanal } from "@prisma/client";

type AsignacionConContexto = {
  id: string;
  userId: string;
  valorObjetivo: number;
  user: { nombre: string; apellido: string };
  definicion: { nombre: string; descripcion: string; unidad: string | null };
  registros: KpiRegistroSemanal[];
};

export function CardKpiEvaluadoPorJefe({
  asignacion,
}: {
  asignacion: AsignacionConContexto;
}) {
  const { semana: semanaActual, anio: anioActual } = getSemanaISO(new Date());

  const registroSemanaActual = asignacion.registros.find(
    (r) => r.semanaDelAnio === semanaActual && r.anio === anioActual
  );

  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const [comentario, setComentario] = useState("");
  const [isPending, startTransition] = useTransition();

  const onEnviar = () => {
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum)) {
      toast.error("Ingresa un valor numérico");
      return;
    }

    startTransition(async () => {
      const res = await reportarKpiPorJefe({
        asignacionId: asignacion.id,
        semana: semanaActual,
        anio: anioActual,
        valor: valorNum,
        comentario: comentario || undefined,
      });

      if (res.success) {
        toast.success("KPI reportado");
        setValor("");
        setComentario("");
        setEditando(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {asignacion.user.nombre[0]}
          {asignacion.user.apellido[0]}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {asignacion.user.nombre} {asignacion.user.apellido}
          </p>
          <h3 className="font-medium text-sm">{asignacion.definicion.nombre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {asignacion.definicion.descripcion}
          </p>
        </div>
      </div>

      {registroSemanaActual && !editando ? (
        <div className="flex items-center justify-between p-3 rounded bg-green-500/10 border border-green-500/20 text-sm">
          <span>
            Ya reportaste esta semana:{" "}
            <strong className="tabular-nums">
              {registroSemanaActual.valor}
            </strong>{" "}
            {asignacion.definicion.unidad}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setValor(String(registroSemanaActual.valor));
              setComentario(registroSemanaActual.comentario ?? "");
              setEditando(true);
            }}
          >
            Editar
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">
              Valor semana {semanaActual} (Meta:{" "}
              {asignacion.valorObjetivo} {asignacion.definicion.unidad})
            </label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={String(asignacion.valorObjetivo)}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Comentario (opcional)
            </label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onEnviar}
              disabled={!valor || isPending}
              size="sm"
            >
              Reportar valor
            </Button>
            {editando && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}

      {asignacion.registros.length > 0 && (
        <div className="mt-4 pt-3 border-t space-y-1">
          <p className="text-xs text-muted-foreground mb-1">Historial</p>
          {asignacion.registros.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">
                Semana {r.semanaDelAnio}
              </span>
              <span className="font-medium tabular-nums">
                {r.valor} {asignacion.definicion.unidad}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
