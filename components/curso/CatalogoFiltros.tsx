"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Area = { id: string; nombre: string; color: string };

const niveles = [
  { value: "BASICO", label: "Basico" },
  { value: "INTERMEDIO", label: "Intermedio" },
  { value: "AVANZADO", label: "Avanzado" },
];

const estados = [
  { value: "", label: "Todos" },
  { value: "no-iniciado", label: "No iniciado" },
  { value: "en-progreso", label: "En progreso" },
  { value: "completado", label: "Completado" },
];

export function CatalogoFiltros({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const areaId = searchParams.get("area") ?? "";
  const nivel = searchParams.get("nivel") ?? "";
  const estado = searchParams.get("estado") ?? "";

  const hasFilters = areaId || nivel || estado;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("area");
    params.delete("nivel");
    params.delete("estado");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Area */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Area</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("area", "")}
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
              onClick={() => updateParam("area", area.id)}
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
              onClick={() => updateParam("nivel", nivel === n.value ? "" : n.value)}
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
              onClick={() => updateParam("estado", e.value)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                estado === e.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
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
