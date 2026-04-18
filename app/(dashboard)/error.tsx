"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold">Algo salio mal</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No pudimos cargar esta pagina. Intenta de nuevo.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">Intentar de nuevo</button>
        <Button variant="outline" render={<Link href="/cursos" />}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
