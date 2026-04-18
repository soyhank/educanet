import Link from "next/link";
import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const nivelColors = {
  BASICO: "bg-green-500/10 text-green-700 dark:text-green-400",
  INTERMEDIO: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  AVANZADO: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const nivelLabels = {
  BASICO: "Basico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

export function CursoCard({
  slug,
  titulo,
  descripcionCorta,
  nivel,
  duracionMinutos,
  puntosRecompensa,
  instructorNombre,
  porcentaje,
  thumbnailUrl,
}: {
  slug: string;
  titulo: string;
  descripcionCorta?: string | null;
  nivel: "BASICO" | "INTERMEDIO" | "AVANZADO";
  duracionMinutos: number;
  puntosRecompensa: number;
  instructorNombre: string;
  porcentaje?: number;
  thumbnailUrl?: string | null;
}) {
  return (
    <Link
      href={`/cursos/${slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={titulo}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2">
          <Badge
            className={cn("text-xs font-medium", nivelColors[nivel])}
            variant="outline"
          >
            {nivelLabels[nivel]}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          <Clock className="h-3 w-3" />
          {duracionMinutos} min
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
          {titulo}
        </h3>
        {descripcionCorta && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {descripcionCorta}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{instructorNombre}</span>
          <span className="flex items-center gap-1 text-primary font-medium">
            <Sparkles className="h-3 w-3" />
            {puntosRecompensa} pts
          </span>
        </div>

        {porcentaje !== undefined && porcentaje > 0 && (
          <div className="space-y-1">
            <Progress value={porcentaje} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{porcentaje}% completado</p>
          </div>
        )}
      </div>
    </Link>
  );
}
