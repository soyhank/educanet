import Link from "next/link";
import {
  AlertTriangle,
  GraduationCap,
  Target,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgresoMes } from "@/lib/kpis/mi-progreso-queries";

type Sugerencia = {
  prioridad: "alta" | "media" | "baja";
  icono: typeof Target;
  titulo: string;
  descripcion: string;
  href: string;
  label: string;
};

function generarSugerencias(progreso: ProgresoMes): Sugerencia[] {
  const s: Sugerencia[] = [];

  if (
    progreso.cumplimientoKpis < 70 &&
    progreso.hayDatosSuficientesKpis &&
    progreso.diasRestantes > 5
  ) {
    s.push({
      prioridad: "alta",
      icono: AlertTriangle,
      titulo: "Tu cumplimiento de KPIs esta bajo el 70%",
      descripcion:
        "Esto reduce tus otros puntos al 50%. Enfocate en los KPIs de mayor peso.",
      href: "/mi-progreso/kpis",
      label: "Ver mis KPIs",
    });
  }

  const cursos = progreso.fuentes.find((f) => f.fuente === "APRENDIZAJE");
  if (cursos && cursos.puntos < 200) {
    s.push({
      prioridad: "media",
      icono: GraduationCap,
      titulo: "Completa un curso esta semana",
      descripcion: `Puedes ganar hasta 400 pts/mes en aprendizaje. Llevas ${cursos.puntos}.`,
      href: "/cursos",
      label: "Ver cursos",
    });
  }

  if (
    progreso.siguienteRango &&
    progreso.puntosParaSiguiente < 150 &&
    progreso.puntosParaSiguiente > 0
  ) {
    s.push({
      prioridad: "alta",
      icono: Trophy,
      titulo: `Estas cerca de ${progreso.siguienteRango}`,
      descripcion: `Solo ${progreso.puntosParaSiguiente} puntos mas para subir de rango.`,
      href: "/mi-progreso/kpis",
      label: "Como sumar rapido",
    });
  }

  if (s.length === 0) {
    s.push({
      prioridad: "baja",
      icono: Target,
      titulo: "Mantienes buen ritmo",
      descripcion:
        "Sigue reportando tus KPIs y completando cursos para asegurar el rango.",
      href: "/mi-progreso/kpis",
      label: "Ver mis KPIs",
    });
  }

  return s.slice(0, 3);
}

const COLOR_PRIORIDAD = {
  alta: "border-amber-300/50 bg-amber-50/70 dark:border-amber-700/40 dark:bg-amber-950/20",
  media: "border-blue-300/40 bg-blue-50/70 dark:border-blue-700/40 dark:bg-blue-950/20",
  baja: "border-border bg-muted/30",
} as const;

export function AccionesSugeridas({ progreso }: { progreso: ProgresoMes }) {
  const sugerencias = generarSugerencias(progreso);

  return (
    <section>
      <h3 className="mb-3 text-base font-semibold">Acciones sugeridas</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sugerencias.map((s, i) => {
          const Icon = s.icono;
          return (
            <Link
              key={i}
              href={s.href}
              className={cn(
                "group flex flex-col gap-2 rounded-lg border p-4 transition-colors",
                COLOR_PRIORIDAD[s.prioridad],
                "hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground" />
                <p className="text-sm font-semibold leading-snug">
                  {s.titulo}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{s.descripcion}</p>
              <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5 transition-all">
                {s.label}
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
