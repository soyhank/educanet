"use client";

import { Bell, CheckCheck, BellOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  url: string | null;
  leida: boolean;
  fecha: string;
};

async function fetchNotificaciones(): Promise<Notificacion[]> {
  const res = await fetch("/api/notificaciones");
  if (!res.ok) return [];
  return res.json();
}

async function marcarLeida(id: string) {
  await fetch("/api/notificaciones", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

async function marcarTodasLeidas() {
  await fetch("/api/notificaciones", {
    method: "PUT",
  });
}

export function NotificacionesBell() {
  const queryClient = useQueryClient();
  const { data: notificaciones = [] } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: fetchNotificaciones,
    refetchInterval: 30_000,
  });

  const marcarMutation = useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificaciones"] }),
  });

  const marcarTodasMutation = useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificaciones"] }),
  });

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
            <Bell className="h-4 w-4" />
            {noLeidas > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {noLeidas > 9 ? "9+" : noLeidas}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notificaciones</h3>
          {noLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodasMutation.mutate()}
              className="text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas
            </Button>
          )}
        </div>

        {notificaciones.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notificaciones.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.leida) marcarMutation.mutate(n.id);
                  if (n.url) window.location.href = n.url;
                }}
                className={cn(
                  "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted",
                  !n.leida && "bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !n.leida && "font-medium")}>
                    {n.titulo}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {n.mensaje}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.fecha), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                {!n.leida && (
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
