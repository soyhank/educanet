import Link from "next/link";
import { Suspense } from "react";
import { Lock } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { mesActual } from "@/lib/gamificacion/periodo";
import {
  obtenerTareasUsuario,
  obtenerEstadisticasTareasUsuario,
} from "@/lib/tareas/queries";
import { obtenerProyeccionMesUsuario } from "@/lib/tareas/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanTareas } from "@/components/tareas/KanbanTareas";
import { ModalNuevaAdHoc } from "@/components/tareas/ModalNuevaAdHoc";

export const metadata = { title: "Mis tareas" };

async function StatsHeader({ userId }: { userId: string }) {
  const { mes, anio } = mesActual();
  const [stats, proyeccion] = await Promise.all([
    obtenerEstadisticasTareasUsuario({ userId, mes, anio }),
    obtenerProyeccionMesUsuario(userId),
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Puntos del mes</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {proyeccion.puntosOtorgadosReales}
              <span className="text-sm text-muted-foreground">/200</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completadas</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalCompletadas}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A tiempo</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {Math.round(stats.tasaATiempo)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bloqueos</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.bloqueosReportados}
            </p>
          </CardContent>
        </Card>
      </div>

      {proyeccion.factor < 1 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
          <p className="font-medium text-primary">Prorrateo activo este mes</p>
          <p className="mt-0.5 text-muted-foreground">
            Tu proyección es {proyeccion.totalProyectado} pts (brutos) y el tope
            mensual es 200. Cada tarea completada se otorga con factor{" "}
            <strong className="text-foreground">× {proyeccion.factor.toFixed(2)}</strong>{" "}
            para que el total final no exceda el tope.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function TareasPage() {
  const user = await requireAuth();

  let tareas: Awaited<ReturnType<typeof obtenerTareasUsuario>> = [];
  try {
    tareas = await obtenerTareasUsuario(user.id);
  } catch (error) {
    console.warn(
      "[tareas] Schema Prompt 18 no aplicado aún:",
      error instanceof Error ? error.message : error,
    );
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
          <Lock className="h-6 w-6 text-warning" />
        </div>
        <h1 className="text-xl font-semibold">Sistema de tareas no disponible</h1>
        <p className="text-sm text-muted-foreground">
          El módulo de tareas operativas aún no está habilitado. Tu
          administrador debe aplicar el schema y los seeds.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Mis tareas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workflows, tareas asignadas y ad-hoc.{" "}
            <Link
              href="/mi-progreso"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Ver progreso del mes
            </Link>
          </p>
        </div>
        <ModalNuevaAdHoc />
      </header>

      <Suspense fallback={<Skeleton className="h-32 rounded-xl" />}>
        <StatsHeader userId={user.id} />
      </Suspense>

      <KanbanTareas tareas={tareas} userId={user.id} />
    </div>
  );
}
