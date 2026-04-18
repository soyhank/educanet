"use client";

import { ProgressRing } from "@/components/shared/ProgressRing";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";
import type { ProgresoRuta } from "@/types/carrera";

export function CarreraProgresoPrincipal({
  progreso,
  puestoOrigen,
  puestoDestino,
}: {
  progreso: ProgresoRuta;
  puestoOrigen: string;
  puestoDestino: string;
}) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Progress ring */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <ProgressRing
            value={progreso.porcentajeTotal}
            size={180}
            strokeWidth={10}
          />
          <p className="text-sm text-muted-foreground">de camino completado</p>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <h2 className="text-lg font-semibold">
            De {puestoOrigen} a {puestoDestino}
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Cursos</span>
                <span className="font-medium">
                  {progreso.cursosCompletados}/{progreso.cursosTotal}
                </span>
              </div>
              <Progress
                value={
                  progreso.cursosTotal > 0
                    ? (progreso.cursosCompletados / progreso.cursosTotal) * 100
                    : 0
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Metricas</span>
                <span className="font-medium">
                  {progreso.metricasCumplidas}/{progreso.metricasTotal}
                </span>
              </div>
              <Progress
                value={
                  progreso.metricasTotal > 0
                    ? (progreso.metricasCumplidas / progreso.metricasTotal) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
          </div>

          {progreso.estaListo && (
            <div className="rounded-lg bg-success/10 p-4 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <PartyPopper className="h-5 w-5 text-success" />
                <p className="font-semibold text-success">
                  Estas listo para ascender!
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Has cumplido todos los requisitos. Habla con tu lider y RRHH
                para coordinar tu proximo paso.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
