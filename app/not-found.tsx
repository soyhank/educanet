import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Pagina no encontrada</h1>
        <p className="text-muted-foreground">
          La pagina que buscas no existe o fue movida.
        </p>
        <Button render={<Link href="/" />}>
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}
