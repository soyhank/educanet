"use client";

import { FolderOpen, FileText, Link2, Download, Captions } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorNotas } from "./notas/EditorNotas";
import type { NotaLeccion, RecursoLeccion } from "@/types/lecciones";

const recursoIconos = { PDF: FileText, ENLACE: Link2, DESCARGA: Download };

export function LeccionPanelDer({
  leccionId,
  notas,
  recursos,
}: {
  leccionId: string;
  notas: NotaLeccion[];
  recursos: RecursoLeccion[];
}) {
  return (
    <Tabs defaultValue="notas" className="flex h-full flex-col">
      <TabsList className="m-2">
        <TabsTrigger value="notas">Notas</TabsTrigger>
        <TabsTrigger value="recursos">Recursos</TabsTrigger>
        <TabsTrigger value="transcripcion">Texto</TabsTrigger>
      </TabsList>

      <TabsContent value="notas" className="flex-1 overflow-y-auto p-4">
        <EditorNotas leccionId={leccionId} notasIniciales={notas} />
      </TabsContent>

      <TabsContent value="recursos" className="flex-1 overflow-y-auto p-4">
        {recursos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay recursos para esta leccion
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recursos.map((r) => {
              const Icon = recursoIconos[r.tipo];
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{r.nombre}</span>
                </a>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="transcripcion" className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Captions className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            La transcripcion estara disponible proximamente
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
