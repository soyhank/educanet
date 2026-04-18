"use client";

import { useState, useTransition } from "react";
import { Sparkles, Trophy, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { otorgarPuntosManual, otorgarBadgeManual } from "@/lib/admin/usuarios-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Badge, UserBadge, TransaccionPuntos } from "@prisma/client";

export function UsuarioGamificacion({
  userId,
  badges,
  userBadges,
  transacciones,
}: {
  userId: string;
  badges: Badge[];
  userBadges: (UserBadge & { badge: Badge })[];
  transacciones: TransaccionPuntos[];
}) {
  const [isPending, startTransition] = useTransition();
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [badgeSeleccionado, setBadgeSeleccionado] = useState("");

  const badgesObtenidosIds = new Set(userBadges.map((ub) => ub.badgeId));
  const badgesDisponibles = badges.filter((b) => !badgesObtenidosIds.has(b.id));

  const handleOtorgarPuntos = () => {
    if (!cantidad || !descripcion) return;
    startTransition(async () => {
      try {
        await otorgarPuntosManual({
          userId,
          cantidad: parseInt(cantidad, 10),
          descripcion,
        });
        toast.success(`${cantidad} puntos otorgados`);
        setCantidad("");
        setDescripcion("");
      } catch {
        toast.error("Error al otorgar puntos");
      }
    });
  };

  const handleOtorgarBadge = () => {
    if (!badgeSeleccionado) return;
    startTransition(async () => {
      try {
        const res = await otorgarBadgeManual(userId, badgeSeleccionado);
        if (res && "error" in res) {
          toast.error(res.error);
        } else {
          toast.success("Badge otorgado");
          setBadgeSeleccionado("");
        }
      } catch {
        toast.error("Error al otorgar badge");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Otorgar puntos */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Otorgar puntos
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-1">
            <Label>Descripcion</Label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Bonus por..."
            />
          </div>
        </div>
        <Button size="sm" onClick={handleOtorgarPuntos} disabled={isPending || !cantidad || !descripcion}>
          {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Otorgar puntos
        </Button>
      </Card>

      {/* Otorgar badge */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Otorgar badge
        </h3>
        <div className="space-y-1">
          <Label>Badge disponible</Label>
          <Select value={badgeSeleccionado} onValueChange={(v) => setBadgeSeleccionado(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Seleccionar badge" /></SelectTrigger>
            <SelectContent>
              {badgesDisponibles.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleOtorgarBadge} disabled={isPending || !badgeSeleccionado}>
          {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Otorgar badge
        </Button>

        {userBadges.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Badges obtenidos:</p>
            <div className="flex flex-wrap gap-1">
              {userBadges.map((ub) => (
                <BadgeUI key={ub.badgeId} variant="outline" className="text-xs">
                  {ub.badge.nombre}
                </BadgeUI>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Historial */}
      <Card className="p-5 lg:col-span-2">
        <h3 className="font-semibold mb-3">Historial de puntos (ultimos 20)</h3>
        {transacciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin transacciones</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Fecha</th>
                  <th className="py-2 text-left font-medium">Razon</th>
                  <th className="py-2 text-right font-medium">Puntos</th>
                  <th className="py-2 text-left font-medium">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="py-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.fecha), { addSuffix: true, locale: es })}
                    </td>
                    <td className="py-2">
                      <BadgeUI variant="outline" className="text-xs">{t.razon}</BadgeUI>
                    </td>
                    <td className="py-2 text-right font-medium text-primary">+{t.cantidad}</td>
                    <td className="py-2 text-muted-foreground text-xs truncate max-w-[200px]">{t.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
