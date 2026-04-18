import { Trophy, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Badge, UserBadge } from "@prisma/client";

export function TabMisBadges({
  allBadges,
  badgesObtenidosIds,
  userBadges,
}: {
  allBadges: Badge[];
  badgesObtenidosIds: Set<string>;
  userBadges: (UserBadge & { badge: Badge })[];
}) {
  const obtenidos = allBadges.filter((b) => badgesObtenidosIds.has(b.id));
  const pendientes = allBadges.filter((b) => !badgesObtenidosIds.has(b.id));

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Unlocked */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Desbloqueados ({obtenidos.length})
          </h3>
          {obtenidos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Completa tu primera leccion para obtener tu primer badge
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {obtenidos.map((badge) => {
                const ub = userBadges.find((u) => u.badgeId === badge.id);
                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger>
                      <Card className="flex flex-col items-center gap-2 p-3 text-center hover:shadow-md transition-shadow">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-xs font-medium line-clamp-1">{badge.nombre}</p>
                        <p className="text-[10px] text-muted-foreground">
                          +{badge.puntosRecompensa} pts
                        </p>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">{badge.nombre}</p>
                      <p className="text-xs">{badge.descripcion}</p>
                      {ub && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Obtenido {formatDistanceToNow(new Date(ub.fechaObtencion), { addSuffix: true, locale: es })}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Locked */}
        {pendientes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Por desbloquear ({pendientes.length})
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {pendientes.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger>
                    <Card className="flex flex-col items-center gap-2 p-3 text-center opacity-50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-medium line-clamp-1">{badge.nombre}</p>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">{badge.nombre}</p>
                    <p className="text-xs">{badge.descripcion}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
