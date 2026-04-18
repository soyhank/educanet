"use client";

import Link from "next/link";
import { PlayCircle, FileText, HelpCircle, CheckCircle, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ModuloConLeccionesYProgreso } from "@/types/lecciones";

const tipoIconos = { VIDEO: PlayCircle, LECTURA: FileText, QUIZ: HelpCircle };

export function LeccionSidebarIzq({
  estructura,
  cursoSlug,
  cursoTitulo,
  leccionActualSlug,
  totalLecciones,
  completadas,
}: {
  estructura: ModuloConLeccionesYProgreso[];
  cursoSlug: string;
  cursoTitulo: string;
  leccionActualSlug: string;
  totalLecciones: number;
  completadas: number;
}) {
  const porcentaje = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <Link
          href={`/cursos/${cursoSlug}`}
          className="text-sm font-medium hover:text-primary line-clamp-1"
        >
          {cursoTitulo}
        </Link>
        <div className="mt-2 space-y-1">
          <Progress value={porcentaje} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {completadas} / {totalLecciones} lecciones
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {estructura.map((modulo) => (
            <div key={modulo.id} className="mb-3">
              <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {modulo.titulo}
              </p>
              {modulo.lecciones.map((lec) => {
                const Icon = tipoIconos[lec.tipo];
                const isCurrent = lec.slug === leccionActualSlug;

                return (
                  <Link
                    key={lec.id}
                    href={`/cursos/${cursoSlug}/${lec.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isCurrent
                        ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {lec.completada ? (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 opacity-40" />
                    )}
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lec.titulo}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
