"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
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

export function CatalogoToolbar({
  onOpenFilters,
}: {
  onOpenFilters?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vista = searchParams.get("vista") ?? "grid";
  const orden = searchParams.get("orden") ?? "recientes";
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ busqueda: busqueda || null });
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, updateParams]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <Select
        value={orden}
        onValueChange={(v) => updateParams({ orden: v })}
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
          onClick={() => updateParams({ vista: "grid" })}
          aria-label="Vista cuadricula"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(vista === "list" && "bg-muted")}
          onClick={() => updateParams({ vista: "list" })}
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
