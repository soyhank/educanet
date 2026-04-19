"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2, Clock, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoCompromiso } from "@prisma/client";
import { ModalAsignarCompromiso } from "@/components/compromisos/ModalAsignarCompromiso";

type CompromisoSemana = {
  id: string;
  titulo: string;
  fechaLimite: Date;
  estado: EstadoCompromiso;
};

type Miembro = {
  user: {
    id: string;
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
    puesto: { nombre: string } | null;
  };
  compromisosSemana: CompromisoSemana[];
  cumplidos: number;
  total: number;
  tasa: number;
};

const ESTADO_BADGE: Record<EstadoCompromiso, { label: string; class: string }> = {
  PROPUESTO: { label: "Propuesta", class: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  PENDIENTE: { label: "Pendiente", class: "bg-muted text-muted-foreground" },
  CUMPLIDO_AUTO: { label: "Por validar", class: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  CUMPLIDO: { label: "Cumplido", class: "bg-primary/20 text-primary" },
  ATRASADO: { label: "Atrasado", class: "bg-destructive/20 text-destructive" },
  NO_CUMPLIDO: { label: "No cumplido", class: "bg-destructive/20 text-destructive" },
};

export function MiembrosCompromisosPanel({
  miembros,
}: {
  miembros: Miembro[];
}) {
  const [asignarA, setAsignarA] = useState<Miembro["user"] | null>(null);

  if (miembros.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No hay miembros activos en el area.
      </div>
    );
  }

  return (
    <section>
      <h3 className="mb-3 text-base font-semibold">
        Compromisos de la semana por miembro
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {miembros.map((m, i) => {
          const iniciales = `${m.user.nombre[0] ?? ""}${m.user.apellido[0] ?? ""}`.toUpperCase();
          return (
            <motion.div
              key={m.user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div className="mb-3 flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  {m.user.avatarUrl && <AvatarImage src={m.user.avatarUrl} alt="" />}
                  <AvatarFallback className="text-xs">{iniciales}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {m.user.nombre} {m.user.apellido}
                  </p>
                  {m.user.puesto && (
                    <p className="truncate text-xs text-muted-foreground">
                      {m.user.puesto.nombre}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAsignarA(m.user)}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Asignar
                </Button>
              </div>

              {m.total > 0 && (
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Cumplimiento esta semana
                    </span>
                    <span className="font-medium tabular-nums">
                      {m.cumplidos}/{m.total} · {Math.round(m.tasa)}%
                    </span>
                  </div>
                  <Progress value={m.tasa} className="h-1.5" />
                </div>
              )}

              {m.compromisosSemana.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Sin compromisos asignados esta semana
                </div>
              ) : (
                <div className="space-y-1.5">
                  {m.compromisosSemana.map((c) => {
                    const badge = ESTADO_BADGE[c.estado];
                    const icon =
                      c.estado === "CUMPLIDO"
                        ? CheckCircle2
                        : c.estado === "PROPUESTO"
                          ? Lightbulb
                          : Clock;
                    const Icon = icon;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 rounded-md border bg-background/50 px-2 py-1.5 text-xs"
                      >
                        <Icon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <p className="min-w-0 flex-1 truncate">{c.titulo}</p>
                        <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                          {format(c.fechaLimite, "d MMM", { locale: es })}
                        </span>
                        <Badge
                          className={cn(
                            "flex-shrink-0 text-[10px]",
                            badge.class
                          )}
                          variant="outline"
                        >
                          {badge.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <ModalAsignarCompromiso
        abierto={!!asignarA}
        onCerrar={() => setAsignarA(null)}
        miembro={asignarA}
      />
    </section>
  );
}
