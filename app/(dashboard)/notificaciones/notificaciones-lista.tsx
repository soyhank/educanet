"use client";

import { useTransition } from "react";
import { Bell, Award, Trophy, BookOpen, TrendingUp, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { Notificacion } from "@prisma/client";

const tipoIconos: Record<string, typeof Bell> = {
  LOGRO: Trophy,
  CERTIFICADO: Award,
  NUEVO_CURSO: BookOpen,
  SUBIDA_NIVEL: TrendingUp,
  OBJETIVO_CUMPLIDO: TrendingUp,
  RECORDATORIO: Bell,
  SISTEMA: Info,
};

async function marcarTodasLeidas() {
  await fetch("/api/notificaciones", { method: "PUT" });
}

export function NotificacionesLista({
  notificaciones,
}: {
  notificaciones: Notificacion[];
}) {
  const [isPending, startTransition] = useTransition();
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const handleMarcarTodas = () => {
    startTransition(async () => {
      await marcarTodasLeidas();
      toast.success("Todas marcadas como leidas");
      window.location.reload();
    });
  };

  if (notificaciones.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Bell className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Estas al dia, no hay notificaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {noLeidas > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarcarTodas} disabled={isPending}>
            <CheckCheck className="mr-1 h-4 w-4" />
            Marcar todas como leidas
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {notificaciones.map((n) => {
          const Icon = tipoIconos[n.tipo] ?? Bell;

          return (
            <a
              key={n.id}
              href={n.url ?? "#"}
              className={cn(
                "flex items-start gap-3 rounded-lg p-4 transition-colors hover:bg-muted",
                !n.leida && "bg-primary/5"
              )}
            >
              <div className="rounded-lg bg-muted p-2 shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.leida && "font-medium")}>
                  {n.titulo}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {n.mensaje}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.fecha), { addSuffix: true, locale: es })}
                </p>
              </div>
              {!n.leida && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
