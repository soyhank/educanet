"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Algo salio mal</h1>
        <p className="text-muted-foreground">
          Ocurrio un error inesperado. Intenta recargar la pagina.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Codigo de error: {error.digest}
          </p>
        )}
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </main>
  );
}
