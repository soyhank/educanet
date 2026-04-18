"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { crearNota, eliminarNota } from "@/lib/lecciones/notas-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Nota = {
  id: string;
  contenido: string;
  timestampVideo: number | null;
  createdAt: Date;
};

export function EditorNotas({
  leccionId,
  notasIniciales,
}: {
  leccionId: string;
  notasIniciales: Nota[];
}) {
  const [notas, setNotas] = useState(notasIniciales);
  const [texto, setTexto] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCrear = () => {
    if (!texto.trim()) return;
    startTransition(async () => {
      try {
        const nueva = await crearNota({ leccionId, contenido: texto.trim() });
        setNotas((prev) => [nueva, ...prev]);
        setTexto("");
        toast.success("Nota guardada");
      } catch {
        toast.error("Error al guardar nota");
      }
    });
  };

  const handleEliminar = (id: string) => {
    startTransition(async () => {
      try {
        await eliminarNota(id);
        setNotas((prev) => prev.filter((n) => n.id !== id));
        toast.success("Nota eliminada");
      } catch {
        toast.error("Error al eliminar");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* New note */}
      <div className="space-y-2">
        <Textarea
          placeholder="Anadir una nota..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          size="sm"
          onClick={handleCrear}
          disabled={!texto.trim() || isPending}
        >
          {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Guardar nota
        </Button>
      </div>

      {/* Notes list */}
      {notas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <StickyNote className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Tus notas apareceran aqui
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notas.map((nota) => (
            <div
              key={nota.id}
              className="group rounded-lg border p-3 text-sm"
            >
              <p className="whitespace-pre-wrap">{nota.contenido}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(nota.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => handleEliminar(nota.id)}
                  aria-label="Eliminar nota"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
