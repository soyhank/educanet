import Link from "next/link";
import { AlertTriangle, Clock, UserCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { datosTarea } from "@/lib/tareas/tarea-datos";
import type { Prisma } from "@prisma/client";

type Tarea = Prisma.TareaInstanciaGetPayload<{
  include: {
    catalogoTarea: true;
    workflowInstancia: { select: { id: true; nombre: true; fechaHito: true; contextoMarca: true } };
    checklistMarcados: true;
  };
}>;

export type TareaCardProps = {
  tarea: Tarea;
  userId: string;
};

const LABEL_CATEGORIA: Record<string, string> = {
  PRE_WEBINAR: "Pre-webinar",
  DURANTE_WEBINAR: "Día W.",
  POST_WEBINAR: "Post-webinar",
  SEO_RECURRENTE: "SEO",
  CAMPANA_META_ADS: "Meta Ads",
  COORDINACION_GENERAL: "Coord.",
  DISENO: "Diseño",
  DESARROLLO_WEB: "Dev",
};

function diasRestantes(fecha: Date): { texto: string; urgente: boolean } {
  const diff = Math.ceil((fecha.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (diff < 0) return { texto: `${Math.abs(diff)}d atrasada`, urgente: true };
  if (diff === 0) return { texto: "Hoy", urgente: true };
  if (diff === 1) return { texto: "Mañana", urgente: true };
  if (diff <= 3) return { texto: `${diff} días`, urgente: true };
  return { texto: `${diff} días`, urgente: false };
}

export function TareaCard({ tarea }: TareaCardProps) {
  const datos = datosTarea(tarea);
  const { workflowInstancia: wf, checklistMarcados } = tarea;
  const total = 5;
  const marcados = checklistMarcados.filter((m) => m.marcado).length;
  const urgencia = diasRestantes(tarea.fechaEstimadaFin);
  const requiereValidacion = tarea.requiereValidacionJefe && !tarea.validadaEn;

  return (
    <Card
      className={cn(
        "transition-colors",
        tarea.estado === "BLOQUEADA" && "border-warning/40",
        urgencia.urgente && "border-primary/50",
        datos.esAdHoc && "border-dashed",
      )}
    >
      <CardContent className="p-3">
        <Link href={`/tareas/${tarea.id}`} className="block space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {datos.esAdHoc
                  ? tarea.origen === "ASIGNADA_JEFE"
                    ? "Asignada por jefe"
                    : "Ad-hoc"
                  : LABEL_CATEGORIA[datos.categoria] ?? datos.categoria}
                {wf?.contextoMarca ? ` · ${wf.contextoMarca}` : ""}
              </p>
              <h4 className="mt-0.5 text-sm font-semibold leading-tight line-clamp-2">
                {datos.nombre}
              </h4>
            </div>
          </div>

          {wf && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {wf.nombre}
            </p>
          )}

          {tarea.estado === "BLOQUEADA" && (
            <div className="flex items-start gap-1.5 rounded-md bg-warning/10 p-2 text-xs">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-warning" />
              <div className="min-w-0">
                <p className="font-medium">
                  Esperando a {tarea.bloqueoExternoResponsable}
                </p>
                {tarea.bloqueoExternoDesde && (
                  <p className="text-muted-foreground">
                    Desde {tarea.bloqueoExternoDesde.toLocaleDateString("es")}
                  </p>
                )}
              </div>
            </div>
          )}

          {requiereValidacion && tarea.estado === "EN_REVISION" && (
            <div className="flex items-start gap-1.5 rounded-md bg-warning/10 p-2 text-xs">
              <UserCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-warning" />
              <p className="text-muted-foreground">Esperando validación del jefe</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span
                className={cn(
                  "tabular-nums",
                  urgencia.urgente && "font-semibold text-primary",
                )}
              >
                {urgencia.texto}
              </span>
            </div>
            {marcados > 0 && !datos.esAdHoc && (
              <span className="tabular-nums text-muted-foreground">
                {marcados}/{total} ✓
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 text-[10px]">
              {datos.tiempoMinimoMin}-{datos.tiempoMaximoMin}min
            </Badge>
            <Badge variant="outline" className="h-5 text-[10px]">
              {datos.puntosBase} pts
            </Badge>
            {tarea.ejecutadaPorOtro && (
              <Badge variant="outline" className="h-5 text-[10px]">
                <Users className="mr-1 h-3 w-3" />
                Ayuda
              </Badge>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
