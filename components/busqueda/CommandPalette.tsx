"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, User, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buscarGlobal, type ResultadoBusqueda } from "@/lib/busqueda/actions";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultadoBusqueda>({ cursos: [], personas: [] });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Search on type
  useEffect(() => {
    if (query.length < 2) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarGlobal(query);
        setResults(r);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Derived: clear results when query is too short
  const displayResults = query.length < 2 ? { cursos: [], personas: [] } : results;

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const hasResults = displayResults.cursos.length > 0 || displayResults.personas.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar cursos, personas...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="ml-auto hidden rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm sm:inline">
          Ctrl+K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cursos, personas..."
              className="border-0 focus-visible:ring-0 shadow-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Limpiar">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {query.length < 2 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </p>
            ) : !hasResults && !isPending ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No encontramos nada con &quot;{query}&quot;
              </p>
            ) : (
              <>
                {displayResults.cursos.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Cursos</p>
                    {displayResults.cursos.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => navigate(`/cursos/${c.slug}`)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{c.titulo}</span>
                      </button>
                    ))}
                  </div>
                )}
                {displayResults.personas.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Personas</p>
                    {displayResults.personas.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-md px-2 py-2 text-sm"
                      >
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{p.nombre} {p.apellido}</span>
                        {p.puesto && (
                          <span className="text-xs text-muted-foreground">· {p.puesto}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
