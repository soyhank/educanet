"use client";

import { useQueryState, parseAsString, parseAsStringLiteral } from "nuqs";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ordenValues, vistaValues } from "@/lib/cursos/filtros-params";

const sharedOpts = { shallow: false, scroll: false } as const;
const shallowOpts = { shallow: true, scroll: false } as const;

export function CatalogoToolbar({
  onOpenFilters,
}: {
  onOpenFilters?: () => void;
}) {
  const [orden, setOrden] = useQueryState(
    "orden",
    parseAsStringLiteral(ordenValues).withDefault("recientes").withOptions(sharedOpts)
  );
  // Vista is client-only — no server re-render needed
  const [vista, setVista] = useQueryState(
    "vista",
    parseAsStringLiteral(vistaValues).withDefault("grid").withOptions(shallowOpts)
  );
  const [busquedaUrl, setBusquedaUrl] = useQueryState(
    "busqueda",
    parseAsString.withDefault("").withOptions(sharedOpts)
  );

  // Local state for debounce — avoids server call on every keystroke
  const [busquedaLocal, setBusquedaLocal] = useState(busquedaUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaUrl(busquedaLocal || null);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaLocal, setBusquedaUrl]);

  // Keep local in sync if URL changes externally (e.g. clear filters)
  useEffect(() => {
    setBusquedaLocal(busquedaUrl);
  }, [busquedaUrl]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={busquedaLocal}
          onChange={(e) => setBusquedaLocal(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <Select
        value={orden}
        onValueChange={(v) => setOrden(v as typeof ordenValues[number])}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recientes">Recientes</SelectItem>
          <SelectItem value="alfabetico">Alfabetico</SelectItem>
          <SelectItem value="duracion">Duracion</SelectItem>
        </SelectContent>
      </Select>

      {/* View toggle */}
      <div className="hidden sm:flex items-center rounded-lg border">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(vista === "grid" && "bg-muted")}
          onClick={() => setVista("grid")}
          aria-label="Vista cuadricula"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(vista === "list" && "bg-muted")}
          onClick={() => setVista("list")}
          aria-label="Vista lista"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile filters button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={onOpenFilters}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filtros
      </Button>
    </div>
  );
}
