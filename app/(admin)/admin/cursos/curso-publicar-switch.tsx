"use client";

import { useTransition } from "react";
import { publicarCurso } from "@/lib/admin/cursos-actions";

export function CursoPublicarSwitch({
  cursoId,
  publicado,
}: {
  cursoId: string;
  publicado: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => publicarCurso(cursoId, !publicado))}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        publicado ? "bg-primary" : "bg-muted"
      } ${isPending ? "opacity-50" : ""}`}
      aria-label={publicado ? "Despublicar" : "Publicar"}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          publicado ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
