import { ArrowRight, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Props = {
  nominador: {
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
  };
  reconocido: {
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
  };
  categoria: {
    nombre: string;
    emoji: string | null;
    color: string;
  };
  mensaje: string;
  createdAt: Date;
};

function iniciales(u: { nombre: string; apellido: string }) {
  return `${u.nombre[0] ?? ""}${u.apellido[0] ?? ""}`.toUpperCase();
}

export function TarjetaReconocimiento({
  nominador,
  reconocido,
  categoria,
  mensaje,
  createdAt,
}: Props) {
  return (
    <article className="relative overflow-hidden rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div
        className="absolute left-0 right-0 top-0 h-1"
        style={{ backgroundColor: categoria.color }}
        aria-hidden="true"
      />

      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border-2 border-background">
            {nominador.avatarUrl && <AvatarImage src={nominador.avatarUrl} alt="" />}
            <AvatarFallback className="text-xs">
              {iniciales(nominador)}
            </AvatarFallback>
          </Avatar>
          <div className="mx-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
          <Avatar className="h-10 w-10 border-2 border-background">
            {reconocido.avatarUrl && <AvatarImage src={reconocido.avatarUrl} alt="" />}
            <AvatarFallback className="text-xs">
              {iniciales(reconocido)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate">
            <span className="font-medium">
              {nominador.nombre} {nominador.apellido}
            </span>{" "}
            <span className="text-muted-foreground">reconocio a</span>
          </p>
          <p className="truncate font-semibold">
            {reconocido.nombre} {reconocido.apellido}
          </p>
        </div>
        <Badge
          className="flex-shrink-0 gap-1 border-transparent"
          style={{
            backgroundColor: `${categoria.color}20`,
            color: categoria.color,
          }}
        >
          {categoria.emoji && <span>{categoria.emoji}</span>}
          <span className="text-xs">{categoria.nombre}</span>
        </Badge>
      </div>

      <p className="whitespace-pre-wrap text-sm text-foreground">{mensaje}</p>

      <div className="mt-3 flex items-center justify-between text-xs">
        <time className="text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </time>
        <span className="flex items-center gap-1 font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          +30 pts
        </span>
      </div>
    </article>
  );
}
