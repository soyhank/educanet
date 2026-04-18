"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoMetaKpi, KpiRegistroSemanal } from "@prisma/client";
import { FormReporteSemanal } from "./FormReporteSemanal";

const TIPO_LABEL: Record<TipoMetaKpi, string> = {
  ABSOLUTA: "Meta absoluta",
  RELATIVA_BASELINE: "Vs tu baseline",
  BINARIA: "Si / No",
};

export function KpiCard({
  asignacionId,
  nombre,
  descripcion,
  unidad,
  peso,
  tipoMeta,
  valorObjetivo,
  valorBaseline,
  cumplimiento,
  tieneRegistros,
  registros,
  semanaActual,
  anioActual,
}: {
  asignacionId: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  peso: number;
  tipoMeta: TipoMetaKpi;
  valorObjetivo: number;
  valorBaseline: number | null;
  cumplimiento: number;
  tieneRegistros: boolean;
  registros: KpiRegistroSemanal[];
  semanaActual: number;
  anioActual: number;
}) {
  const [expandido, setExpandido] = useState(false);

  const registroSemanaActual = registros.find(
    (r) => r.semanaDelAnio === semanaActual && r.anio === anioActual
  );

  const estado =
    !tieneRegistros
      ? { color: "text-muted-foreground bg-muted", label: "Sin datos" }
      : cumplimiento >= 95
        ? {
            color: "text-primary bg-primary/10",
            label: `${Math.round(cumplimiento)}%`,
          }
        : cumplimiento >= 70
          ? {
              color: "text-blue-600 dark:text-blue-300 bg-blue-500/10",
              label: `${Math.round(cumplimiento)}%`,
            }
          : {
              color: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
              label: `${Math.round(cumplimiento)}%`,
            };

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{nombre}</p>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Peso {peso}%
            </span>
            <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {TIPO_LABEL[tipoMeta]}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {descripcion}
          </p>
        </div>
        <div
          className={cn(
            "flex-shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
            estado.color
          )}
        >
          {estado.label}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
            expandido && "rotate-180"
          )}
        />
      </button>

      {expandido && (
        <div className="space-y-3 border-t p-4">
          <p className="text-sm text-muted-foreground">{descripcion}</p>

          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-md border bg-muted/30 p-2">
              <p className="text-muted-foreground">Objetivo del mes</p>
              <p className="mt-0.5 font-medium">
                {valorObjetivo} {unidad}
              </p>
            </div>
            {valorBaseline !== null && (
              <div className="rounded-md border bg-muted/30 p-2">
                <p className="text-muted-foreground">Tu baseline</p>
                <p className="mt-0.5 font-medium">
                  {valorBaseline} {unidad}
                </p>
              </div>
            )}
            <div className="rounded-md border bg-muted/30 p-2">
              <p className="text-muted-foreground">Reportes</p>
              <p className="mt-0.5 font-medium">
                {registros.length} semanas
              </p>
            </div>
          </div>

          {registros.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Historial semanal
              </p>
              <div className="space-y-1">
                {registros.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-md border bg-background/50 px-3 py-1.5 text-xs"
                  >
                    <span>
                      Semana {r.semanaDelAnio} / {r.anio}
                    </span>
                    <span className="font-medium tabular-nums">
                      {r.valor} {unidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FormReporteSemanal
            asignacionId={asignacionId}
            unidad={unidad}
            semanaActual={semanaActual}
            anio={anioActual}
            valorExistente={registroSemanaActual?.valor ?? null}
            comentarioExistente={registroSemanaActual?.comentario ?? null}
          />

          {!tieneRegistros && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300/40 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <p>
                Aun no has reportado valores este mes. Reporta al menos 2
                semanas para que el cumplimiento se empiece a calcular.
              </p>
            </div>
          )}

          {cumplimiento >= 100 && tieneRegistros && (
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-2 text-xs text-primary">
              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
              <p>Meta alcanzada. Sigue reportando para consolidar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
