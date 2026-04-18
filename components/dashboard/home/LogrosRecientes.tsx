"use client";

import { Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
type Logro = {
  badge: { nombre: string; iconoUrl: string; descripcion: string };
  fechaObtencion: Date | string;
};

export function LogrosRecientes({ logros }: { logros: Logro[] }) {
  if (logros.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Logros recientes</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
          <Trophy className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Completa tu primera leccion para obtener tu primer badge
          </p>
        </div>
      </section>
    );
  }

  return (
    <TooltipProvider>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Logros recientes</h2>
        <div className="flex flex-wrap gap-3">
          {logros.map((logro) => {
            const fecha = new Date(logro.fechaObtencion);

            return (
              <Tooltip key={logro.badge.nombre}>
                <TooltipTrigger>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl transition-transform hover:scale-110">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{logro.badge.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(fecha, { addSuffix: true, locale: es })}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}
