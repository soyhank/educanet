"use client";

import { useState } from "react";
import { Plus, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompromisoCard } from "./CompromisoCard";
import { ModalNuevoCompromiso } from "./ModalNuevoCompromiso";
import type { EstadoCompromiso } from "@prisma/client";

type Compromiso = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: Date;
  fechaCumplimiento: Date | null;
  estado: EstadoCompromiso;
  puntosOtorgados: number;
};

export function CompromisosCliente({
  pendientes,
  porValidar,
  completados,
  noCumplidos,
}: {
  pendientes: Compromiso[];
  porValidar: Compromiso[];
  completados: Compromiso[];
  noCumplidos: Compromiso[];
}) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const columna = (
    titulo: string,
    icono: React.ReactNode,
    items: Compromiso[],
    empty: string
  ) => (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        {icono}
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <span className="text-xs text-muted-foreground">· {items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <CompromisoCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis compromisos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Declara tus entregables de la semana y gana puntos al cumplirlos.
          </p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo compromiso
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columna(
          "Pendientes",
          <Clock className="h-4 w-4 text-muted-foreground" />,
          pendientes,
          "Nada pendiente. Crea tu primer compromiso."
        )}
        {columna(
          "Por validar",
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
          porValidar,
          "No tienes compromisos esperando validacion."
        )}
        {columna(
          "Completados",
          <CheckCircle2 className="h-4 w-4 text-primary" />,
          completados,
          "Aun no cumples compromisos. Anima."
        )}
      </div>

      {noCumplidos.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold">Atrasados / no cumplidos</h3>
            <span className="text-xs text-muted-foreground">
              · {noCumplidos.length}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {noCumplidos.map((c) => (
              <CompromisoCard key={c.id} {...c} />
            ))}
          </div>
        </div>
      )}

      <ModalNuevoCompromiso
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </div>
  );
}
