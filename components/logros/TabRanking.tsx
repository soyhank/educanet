"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toggleMostrarEnRanking } from "@/lib/logros/actions";
import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/lib/gamificacion/rankings";

function mensajePosicion(pos: number, total: number): string {
  const pct = pos / total;
  if (pos <= 3) return "Estas entre los referentes de tu area!";
  if (pct <= 0.25) return "Vas por muy buen camino";
  if (pct <= 0.75) return "Sigue asi, cada dia cuenta";
  return "Tu camino apenas empieza — hay espacio para crecer";
}

export function TabRanking({
  ranking,
  mostrarEnRanking,
  areaNombre,
  areaId,
}: {
  ranking: {
    lideres: RankingEntry[];
    posicionUsuario: number | null;
    cercanosAlUsuario: RankingEntry[];
    totalParticipantes: number;
  } | null;
  mostrarEnRanking: boolean;
  areaNombre?: string | null;
  areaId?: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  if (!areaId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Necesitas tener un area asignada para ver el ranking
        </p>
      </Card>
    );
  }

  if (!mostrarEnRanking) {
    return (
      <Card className="mx-auto max-w-md space-y-4 p-8 text-center">
        <EyeOff className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="font-semibold">Participa en el ranking</h3>
        <p className="text-sm text-muted-foreground">
          Activa tu visibilidad para aparecer en el ranking de{" "}
          {areaNombre ?? "tu area"}. Solo veras referentes y tu posicion.
        </p>
        <Button
          disabled={isPending}
          onClick={() => startTransition(() => toggleMostrarEnRanking(true))}
        >
          <Eye className="mr-2 h-4 w-4" />
          Activar ranking
        </Button>
      </Card>
    );
  }

  if (!ranking || ranking.totalParticipantes === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Aun no hay suficientes participantes en tu area
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User position */}
      {ranking.posicionUsuario && (
        <Card className="bg-primary/5 p-4">
          <p className="text-sm font-medium">
            Estas en la posicion {ranking.posicionUsuario} de{" "}
            {ranking.totalParticipantes}
          </p>
          <p className="text-xs text-muted-foreground">
            {mensajePosicion(ranking.posicionUsuario, ranking.totalParticipantes)}
          </p>
        </Card>
      )}

      {/* Leaders */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Referentes de {areaNombre ?? "tu area"}
        </h3>
        <div className="space-y-2">
          {ranking.lideres.map((entry) => (
            <RankingRow key={entry.userId} entry={entry} />
          ))}
        </div>
      </div>

      {/* Context around user */}
      {ranking.cercanosAlUsuario.length > 0 &&
        ranking.cercanosAlUsuario.some((e) => !ranking.lideres.find((l) => l.userId === e.userId)) && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Tu contexto
            </h3>
            <div className="space-y-2">
              {ranking.cercanosAlUsuario.map((entry) => (
                <RankingRow key={entry.userId} entry={entry} />
              ))}
            </div>
          </div>
        )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {ranking.totalParticipantes} participantes
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          disabled={isPending}
          onClick={() => startTransition(() => toggleMostrarEnRanking(false))}
        >
          <EyeOff className="mr-1 h-3 w-3" />
          Ocultar del ranking
        </Button>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: RankingEntry }) {
  const initials = `${entry.nombre[0]}${entry.apellido[0]}`.toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        entry.esUsuarioActual && "bg-primary/5 border-primary/20"
      )}
    >
      <span className="w-6 text-center text-sm font-medium text-muted-foreground">
        {entry.position}
      </span>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-muted text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.nombre} {entry.apellido}
          {entry.esUsuarioActual && (
            <span className="ml-1 text-xs text-primary">(Tu)</span>
          )}
        </p>
        {entry.puesto && (
          <p className="text-xs text-muted-foreground">{entry.puesto}</p>
        )}
      </div>
      <span className="text-sm font-semibold text-primary">{entry.valor}</span>
    </div>
  );
}
