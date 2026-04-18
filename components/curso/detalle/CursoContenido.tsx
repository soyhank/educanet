"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuloConProgreso, EstadoCurso } from "@/types/cursos";

const tipoIconos = {
  VIDEO: PlayCircle,
  LECTURA: FileText,
  QUIZ: HelpCircle,
};

function formatDuracion(segundos: number): string {
  if (segundos === 0) return "";
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function CursoContenido({
  modulos,
  cursoSlug,
}: {
  modulos: ModuloConProgreso[];
  cursoSlug: string;
  estado?: EstadoCurso;
}) {
  // Expand first incomplete module, or first module if none started
  const firstIncompleteIndex = modulos.findIndex((m) => !m.completado);
  const defaultOpen =
    firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;

  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  return (
    <div className="space-y-3">
      {modulos.map((modulo, mi) => (
        <div key={modulo.id} className="rounded-lg border">
          {/* Module header */}
          <button
            onClick={() => setOpenIndex(openIndex === mi ? null : mi)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            aria-expanded={openIndex === mi}
          >
            <div className="flex items-center gap-3">
              {modulo.completado ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-success" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {mi + 1}
                </span>
              )}
              <div>
                <p className="font-medium">{modulo.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {modulo.totalLecciones} lecciones ·{" "}
                  {modulo.leccionesCompletadas}/{modulo.totalLecciones}{" "}
                  completadas
                </p>
              </div>
            </div>
            <svg
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                openIndex === mi && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Lessons list */}
          {openIndex === mi && (
            <div className="border-t">
              {modulo.lecciones.map((leccion) => {
                const Icon = tipoIconos[leccion.tipo];
                const duracion = formatDuracion(leccion.duracionSegundos);

                return (
                  <Link
                    key={leccion.id}
                    href={`/cursos/${cursoSlug}/${leccion.slug}`}
                    className="flex items-center gap-3 border-b last:border-b-0 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    {/* Status icon */}
                    {leccion.completada ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                    ) : leccion.porcentajeVisto > 0 ? (
                      <div className="relative h-4 w-4 shrink-0">
                        <Circle className="h-4 w-4 text-primary/30" />
                        <div
                          className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-primary"
                        >
                          {leccion.porcentajeVisto}
                        </div>
                      </div>
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}

                    {/* Type icon */}
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

                    {/* Title */}
                    <span className="flex-1 truncate">{leccion.titulo}</span>

                    {/* Quiz badge */}
                    {leccion.tieneQuiz && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        Quiz
                      </span>
                    )}

                    {/* Duration */}
                    {duracion && (
                      <span className="text-xs text-muted-foreground">
                        {duracion}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
