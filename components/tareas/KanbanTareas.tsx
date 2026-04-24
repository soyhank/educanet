import type { EstadoTareaInstancia } from "@prisma/client";

import { TareaCard, type TareaCardProps } from "./TareaCard";

type TareaEnKanban = TareaCardProps["tarea"];

type KanbanProps = {
  tareas: TareaEnKanban[];
  userId: string;
};

const COLUMNAS: Array<{
  estado: EstadoTareaInstancia;
  titulo: string;
  descripcion: string;
  tono: string;
}> = [
  {
    estado: "PENDIENTE",
    titulo: "Pendientes",
    descripcion: "Por iniciar",
    tono: "border-muted-foreground/20",
  },
  {
    estado: "EN_PROGRESO",
    titulo: "En progreso",
    descripcion: "Ejecutando ahora",
    tono: "border-primary/40",
  },
  {
    estado: "BLOQUEADA",
    titulo: "Bloqueadas",
    descripcion: "Esperando a un tercero",
    tono: "border-warning/50",
  },
  {
    estado: "EN_REVISION",
    titulo: "En revisión",
    descripcion: "Completadas, esperando validación",
    tono: "border-muted-foreground/20",
  },
];

export function KanbanTareas({ tareas, userId }: KanbanProps) {
  const porEstado = new Map<EstadoTareaInstancia, TareaEnKanban[]>();
  for (const t of tareas) {
    const arr = porEstado.get(t.estado) ?? [];
    arr.push(t);
    porEstado.set(t.estado, arr);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {COLUMNAS.map((col) => {
        const items = porEstado.get(col.estado) ?? [];
        return (
          <div
            key={col.estado}
            className={`flex flex-col rounded-xl border-2 border-dashed ${col.tono} bg-muted/20 p-3`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{col.titulo}</h3>
                <p className="text-xs text-muted-foreground">{col.descripcion}</p>
              </div>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Sin tareas
                </p>
              ) : (
                items.map((t) => <TareaCard key={t.id} tarea={t} userId={userId} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
