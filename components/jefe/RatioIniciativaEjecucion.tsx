import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MiembroRatio = {
  id: string;
  nombre: string;
  apellido: string;
  puntosTareasOperativas: number;
  puntosCompromisos: number;
};

/**
 * Mide el balance entre cumplir el rol (TAREAS_OPERATIVAS) vs proponer
 * iniciativa propia (COMPROMISOS). Sirve de métrica cualitativa para las
 * conversaciones de carrera del jefe con cada miembro.
 */
export function CardRatioIniciativaEjecucion({
  miembros,
}: {
  miembros: MiembroRatio[];
}) {
  if (miembros.length === 0) return null;

  const promTareas =
    miembros.reduce((s, m) => s + m.puntosTareasOperativas, 0) / miembros.length;
  const promCompromisos =
    miembros.reduce((s, m) => s + m.puntosCompromisos, 0) / miembros.length;
  const ratio = promTareas > 0 ? promCompromisos / promTareas : 0;

  let interpretacion: string;
  let detalle: string;
  let color: string;
  if (ratio < 0.1) {
    interpretacion = "Enfocado en ejecutar";
    detalle =
      "El equipo cumple el rol pero casi no propone iniciativas. Abrí espacio para que aparezcan compromisos propios.";
    color = "hsl(220 10% 50%)";
  } else if (ratio < 0.3) {
    interpretacion = "Balance saludable";
    detalle =
      "Hay equilibrio entre ejecución del rol e iniciativas propias. Mantené este ritmo.";
    color = "hsl(142 65% 45%)";
  } else {
    interpretacion = "Alta iniciativa";
    detalle =
      "Tu equipo va más allá del rol. Asegurate que las iniciativas no tapen la operación.";
    color = "hsl(262 70% 60%)";
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Iniciativa del equipo
        </span>
        <Sparkles className="h-4 w-4 text-muted-foreground opacity-60" />
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <span
          className="text-3xl font-semibold tabular-nums"
          style={{ color }}
        >
          {(ratio * 100).toFixed(0)}%
        </span>
        <span className="text-xs text-muted-foreground">
          compromisos / tareas del rol
        </span>
      </div>

      <p className="text-sm font-medium text-foreground">{interpretacion}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detalle}</p>
    </div>
  );
}

/**
 * Barras dobles por miembro: tareas operativas (rol) + compromisos propios.
 * Permite ver de un vistazo quién solo cumple y quién además propone.
 */
export function ComparativaPorMiembro({
  miembros,
  topeTareasOperativas,
  topeCompromisos,
}: {
  miembros: MiembroRatio[];
  topeTareasOperativas: number;
  topeCompromisos: number;
}) {
  if (miembros.length === 0) return null;

  const anonimizado = false; // si aplica, se pasa como prop en el futuro

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-base font-semibold">Ejecución vs iniciativa</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Tareas operativas (rol) vs compromisos propios por miembro.
      </p>
      <ul className="mt-5 space-y-5">
        {miembros.map((m, i) => {
          const pctTareas = Math.min(
            100,
            (m.puntosTareasOperativas / topeTareasOperativas) * 100
          );
          const pctCompromisos = Math.min(
            100,
            (m.puntosCompromisos / topeCompromisos) * 100
          );
          const nombre = anonimizado
            ? `Persona ${String.fromCharCode(65 + i)}`
            : `${m.nombre} ${m.apellido}`;
          return (
            <li key={m.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{nombre}</span>
              </div>
              <BarraFuente
                label="Rol"
                valor={m.puntosTareasOperativas}
                tope={topeTareasOperativas}
                porcentaje={pctTareas}
                color="bg-emerald-600 dark:bg-emerald-400"
              />
              <BarraFuente
                label="Iniciativa"
                valor={m.puntosCompromisos}
                tope={topeCompromisos}
                porcentaje={pctCompromisos}
                color="bg-teal-500 dark:bg-teal-400"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BarraFuente({
  label,
  valor,
  tope,
  porcentaje,
  color,
}: {
  label: string;
  valor: number;
  tope: number;
  porcentaje: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {valor} / {tope} pts
        </span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
