"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarLeccionCompletada } from "@/lib/cursos/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LeccionLectura({
  leccionId,
  contenido,
  completada,
  puntosRecompensa,
}: {
  leccionId: string;
  contenido: string;
  completada: boolean;
  puntosRecompensa: number;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completada);
  const [isPending, startTransition] = useTransition();

  const palabras = contenido.split(/\s+/).length;
  const minLectura = Math.max(1, Math.ceil(palabras / 200));

  const handleCompletar = () => {
    startTransition(async () => {
      try {
        const res = await marcarLeccionCompletada(leccionId);
        if ("error" in res) {
          toast.error("Error al completar");
          return;
        }
        setDone(true);
        toast.success(`Leccion completada! +${res.puntosGanados} puntos`);
        router.refresh();
      } catch {
        toast.error("Error de conexion");
      }
    });
  };

  return (
    <div className="space-y-6">
      {done && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          Lectura completada — +{puntosRecompensa} puntos
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        {minLectura} min de lectura
      </div>

      <article className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {contenido}
        </ReactMarkdown>
      </article>

      {!done && (
        <div className="border-t pt-4">
          <Button onClick={handleCompletar} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            He terminado la lectura
          </Button>
        </div>
      )}
    </div>
  );
}
