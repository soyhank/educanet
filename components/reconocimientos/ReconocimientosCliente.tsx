"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModalNuevaNominacion } from "./ModalNuevaNominacion";
import { TarjetaReconocimiento } from "./TarjetaReconocimiento";
import { MotionItem } from "@/components/shared/MotionGrid";

type RecItem = {
  id: string;
  mensaje: string;
  createdAt: Date;
  nominador: {
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
  };
  reconocido: {
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
  };
  categoria: {
    nombre: string;
    emoji: string | null;
    color: string;
  };
};

export function ReconocimientosCliente({
  feed,
  recibidos,
  dados,
  companeros,
  categorias,
}: {
  feed: RecItem[];
  recibidos: RecItem[];
  dados: RecItem[];
  companeros: Parameters<typeof ModalNuevaNominacion>[0]["companeros"];
  categorias: Parameters<typeof ModalNuevaNominacion>[0]["categorias"];
}) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const emptyState = (texto: string) => (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reconocimientos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprecia el trabajo de tus compañeros y gana puntos cuando te
            reconozcan.
          </p>
        </div>
        <Button size="lg" onClick={() => setModalAbierto(true)}>
          <Heart className="mr-2 h-4 w-4" />
          Reconocer a un compañero
        </Button>
      </div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed del equipo</TabsTrigger>
          <TabsTrigger value="recibidos">
            Recibidos ({recibidos.length})
          </TabsTrigger>
          <TabsTrigger value="dados">Dados ({dados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4">
          {feed.length === 0 ? (
            emptyState(
              "Aun no hay reconocimientos en tu equipo. Se el primero en reconocer."
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {feed.map((r, i) => (
                <MotionItem key={r.id} index={i} hover>
                  <TarjetaReconocimiento {...r} />
                </MotionItem>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recibidos" className="mt-4">
          {recibidos.length === 0 ? (
            emptyState(
              "Aun no has recibido reconocimientos. Sigue sumando aportes al equipo."
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recibidos.map((r, i) => (
                <MotionItem key={r.id} index={i} hover>
                  <TarjetaReconocimiento {...r} />
                </MotionItem>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dados" className="mt-4">
          {dados.length === 0 ? (
            emptyState(
              "Aun no has reconocido a nadie. Reconocer fortalece al equipo."
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {dados.map((r, i) => (
                <MotionItem key={r.id} index={i} hover>
                  <TarjetaReconocimiento {...r} />
                </MotionItem>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ModalNuevaNominacion
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        companeros={companeros}
        categorias={categorias}
      />
    </div>
  );
}
