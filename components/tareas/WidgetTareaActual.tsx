import Link from "next/link";
import { ArrowRight, Clock, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { obtenerTareaActual } from "@/lib/tareas/queries";
import { datosTarea } from "@/lib/tareas/tarea-datos";

export async function WidgetTareaActual({ userId }: { userId: string }) {
  // Resiliente: si las tablas de Prompt 18 aún no existen en la DB (db push
  // pendiente), no romper /home. Se degrada silenciosamente.
  let tarea: Awaited<ReturnType<typeof obtenerTareaActual>> = null;
  try {
    tarea = await obtenerTareaActual(userId);
  } catch (error) {
    console.warn(
      "[WidgetTareaActual] No se pudo cargar la tarea actual (¿schema Prompt 18 sin aplicar?):",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
  if (!tarea) return null;

  const datos = datosTarea(tarea);
  const totalItems = tarea.catalogoTarea?.checklistItems.length ?? 0;
  const completados = tarea.checklistMarcados.length;
  const progreso = totalItems > 0 ? Math.round((completados / totalItems) * 100) : 0;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardDescription className="text-xs uppercase tracking-wider">
          Tu tarea actual
        </CardDescription>
        <CardTitle className="text-xl">{datos.nombre}</CardTitle>
        {tarea.workflowInstancia && (
          <p className="text-sm text-muted-foreground">
            {tarea.workflowInstancia.nombre}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {totalItems > 0 && (
            <span className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              {completados}/{totalItems} pasos
            </span>
          )}
          {tarea.fechaInicioReal && (
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="h-3 w-3" />
              En progreso desde{" "}
              {new Date(tarea.fechaInicioReal).toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <Progress value={progreso} className="h-2" />
        <div className="flex gap-2 pt-1">
          <Button size="sm" render={<Link href={`/tareas/${tarea.id}`} />}>
            Continuar
            <ArrowRight />
          </Button>
          <Button size="sm" variant="subtle" render={<Link href="/tareas" />}>
            Ver todas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
