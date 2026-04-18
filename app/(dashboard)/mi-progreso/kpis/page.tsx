import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { mesActual, getSemanaISO } from "@/lib/gamificacion/periodo";
import {
  obtenerKpisConAsignaciones,
  obtenerProgresoMes,
} from "@/lib/kpis/mi-progreso-queries";
import { KpiCard } from "@/components/kpis/KpiCard";

export const metadata = { title: "Mis KPIs" };

export default async function MisKpisPage() {
  const user = await requireAuth();
  const { mes, anio } = mesActual();
  const { semana } = getSemanaISO(new Date());

  const [asignaciones, progreso] = await Promise.all([
    obtenerKpisConAsignaciones(user.id, mes, anio),
    obtenerProgresoMes(user.id, mes, anio),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/mi-progreso"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver a Mi progreso
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Mis KPIs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.puesto?.nombre ?? "Sin puesto"} · Cumplimiento global{" "}
          <span className="font-medium text-foreground">
            {progreso.cumplimientoKpis.toFixed(0)}%
          </span>
        </p>
      </div>

      {asignaciones.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Aun no tienes KPIs asignados este mes. Tu jefe o RRHH los
            asignaran al iniciar el periodo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {asignaciones.map((a) => {
            const cumpl = progreso.cumplimientos.find(
              (c) => c.asignacionId === a.id
            );
            return (
              <KpiCard
                key={a.id}
                asignacionId={a.id}
                nombre={a.definicion.nombre}
                descripcion={a.definicion.descripcion}
                unidad={a.definicion.unidad}
                peso={a.definicion.peso}
                tipoMeta={a.definicion.tipoMeta}
                valorObjetivo={a.valorObjetivo}
                valorBaseline={a.valorBaseline}
                cumplimiento={cumpl?.cumplimiento ?? 0}
                tieneRegistros={cumpl?.tieneRegistros ?? false}
                registros={a.registros}
                semanaActual={semana}
                anioActual={anio}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
