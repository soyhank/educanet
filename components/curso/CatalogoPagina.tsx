"use client";

import { useState, Suspense } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CatalogoToolbar } from "./CatalogoToolbar";
import { CatalogoFiltros } from "./CatalogoFiltros";

type Area = { id: string; nombre: string; color: string };

export function CatalogoPagina({
  areas,
  children,
}: {
  areas: Area[];
  children: React.ReactNode;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Suspense>
        <CatalogoToolbar onOpenFilters={() => setFiltersOpen(true)} />
      </Suspense>

      <div className="flex gap-8">
        {/* Desktop filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <Suspense>
            <CatalogoFiltros areas={areas} />
          </Suspense>
        </aside>

        {/* Mobile filters sheet */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="left" className="w-72 p-6">
            <h3 className="mb-4 font-semibold">Filtros</h3>
            <Suspense>
              <CatalogoFiltros areas={areas} />
            </Suspense>
          </SheetContent>
        </Sheet>

        {/* Results */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
