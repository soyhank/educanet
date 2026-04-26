"use client";

import { useQueryState, parseAsString, parseAsStringLiteral } from "nuqs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  nivelValues,
  estadoValues,
} from "@/lib/cursos/filtros-params";

type Area = { id: string; nombre: string; color: string };

const niveles = [
  { value: "BASICO" as const, label: "Basico" },
  { value: "INTERMEDIO" as const, label: "Intermedio" },
  { value: "AVANZADO" as const, label: "Avanzado" },
];

const estados = [
  { value: "" as const, label: "Todos" },
  { value: "no-iniciado" as const, label: "No iniciado" },
  { value: "en-progreso" as const, label: "En progreso" },
  { value: "completado" as const, label: "Completado" },
];

const sharedOpts = { shallow: false, scroll: false } as const;

export function CatalogoFiltros({ areas }: { areas: Area[] }) {
  const [areaId, setAreaId] = useQueryState(
    "area",
    parseAsString.withDefault("").withOptions(sharedOpts)
  );
  const [nivel, setNivel] = useQueryState(
    "nivel",
    parseAsStringLiteral(nivelValues).withOptions(sharedOpts)
  );
  const [estado, setEstado] = useQueryState(
    "estado",
    parseAsStringLiteral(estadoValues).withOptions(sharedOpts)
  );

  const hasFilters = areaId || nivel || estado;

  const clearFilters = () => {
    setAreaId("");
    setNivel(null);
    setEstado(null);
  };

  return (
    <div className="space-y-6">
      {/* Area */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Area</h4>
        <div className="space-y-1">
          <button
            onClick={() => setAreaId("")}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
              !areaId ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Todas las areas
          </button>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setAreaId(area.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                areaId === area.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              {area.nombre}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Nivel */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Nivel</h4>
        <div className="space-y-1">
          {niveles.map((n) => (
            <button
              key={n.value}
              onClick={() => setNivel(nivel === n.value ? null : n.value)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                nivel === n.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Estado */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Estado</h4>
        <div className="space-y-1">
          {estados.map((e) => (
            <button
              key={e.value}
              onClick={() => setEstado(e.value || null)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                (estado ?? "") === e.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        </>
      )}
    </div>
  );
}
