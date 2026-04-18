import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icono: Icon,
  titulo,
  descripcion,
  accion,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{titulo}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{descripcion}</p>
      </div>
      {accion && (
        <Button variant="outline" render={<Link href={accion.href} />}>
          {accion.label}
        </Button>
      )}
    </div>
  );
}
