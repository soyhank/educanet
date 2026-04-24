"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/primitives/GlassCard";
import { FormReporteSemanal } from "./FormReporteSemanal";
import type { TipoFuenteKpi, EstadoValidacionKpi, TipoMetaKpi } from "@prisma/client";

type RegistroReciente = {
  semanaDelAnio: number;
  valor: number;
  estadoValidacion: EstadoValidacionKpi;
  comentario: string | null;
};

type Props = {
  asignacionId: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  valorObjetivo: number;
  tipoMeta: TipoMetaKpi;
  tipoFuente: TipoFuenteKpi;
  fuenteDeDato?: string | null;
  funcionCalculo?: string | null;
  registros: RegistroReciente[];
  semanaActual: number;
  anioActual: number;
  permiteEditar: boolean;
};

const BADGE_TIPO: Record<
  TipoFuenteKpi,
  { color: string; icono: string; label: string }
> = {
  AUTO_CALCULADO: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icono: "🤖",
    label: "Auto",
  },
  AUTO_REPORTADO: {
    color: "bg-primary/10 text-primary border-primary/30",
    icono: "📝",
    label: "Tú reportas",
  },
  EVALUADO_POR_JEFE: {
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icono: "👤",
    label: "Jefe reporta",
  },
};

const BADGE_ESTADO: Record<
  EstadoValidacionKpi,
  { color: string; label: string }
> = {
  PENDIENTE: { color: "bg-amber-500/10 text-amber-500", label: "⏳ Pendiente validación" },
  VALIDADO: { color: "bg-green-500/10 text-green-500", label: "✓ Validado" },
  RECHAZADO: { color: "bg-red-500/10 text-red-500", label: "✗ Rechazado" },
  AUTO_VALIDADO: { color: "bg-blue-500/10 text-blue-500", label: "🤖 Auto" },
};

export function KpiCardEmpleado({
  asignacionId,
  nombre,
  descripcion,
  unidad,
  valorObjetivo,
  tipoFuente,
  fuenteDeDato,
  registros,
  semanaActual,
  anioActual,
  permiteEditar,
}: Props) {
  const badge = BADGE_TIPO[tipoFuente];
  const registroActual = registros[0];
  const estadoBadge = registroActual
    ? BADGE_ESTADO[registroActual.estadoValidacion]
    : null;

  const valorActual = registroActual?.valor ?? null;
  const comentarioActual = registroActual?.comentario ?? null;

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-snug">{nombre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {descripcion}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium flex-shrink-0",
            badge.color
          )}
        >
          <span>{badge.icono}</span>
          <span>{badge.label}</span>
        </div>
      </div>

      {fuenteDeDato && tipoFuente === "AUTO_REPORTADO" && (
        <div className="mb-3 p-2 rounded bg-secondary/50 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Fuente: </span>
          {fuenteDeDato}
        </div>
      )}

      {registroActual && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xl font-semibold tabular-nums">
              {registroActual.valor}
              <span className="text-sm text-muted-foreground ml-1">{unidad}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Semana {registroActual.semanaDelAnio}
            </p>
          </div>
          {estadoBadge && (
            <span
              className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                estadoBadge.color
              )}
            >
              {estadoBadge.label}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-3">
        Meta: {valorObjetivo} {unidad}
      </p>

      {permiteEditar && tipoFuente === "AUTO_REPORTADO" && (
        <FormReporteSemanal
          asignacionId={asignacionId}
          unidad={unidad}
          semanaActual={semanaActual}
          anio={anioActual}
          valorExistente={valorActual}
          comentarioExistente={comentarioActual}
        />
      )}

      {tipoFuente === "AUTO_CALCULADO" && (
        <p className="text-xs text-muted-foreground italic">
          Se actualiza automáticamente cada domingo.
        </p>
      )}

      {tipoFuente === "EVALUADO_POR_JEFE" && (
        <p className="text-xs text-muted-foreground italic">
          Tu jefe reporta este valor periódicamente.
        </p>
      )}
    </GlassCard>
  );
}
