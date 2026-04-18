import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sin acceso" };

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <Lock className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No tienes acceso a esta seccion</h1>
        <p className="text-muted-foreground">
          Tu cuenta no tiene los permisos necesarios para ver esta pagina.
          Si crees que esto es un error, contacta al administrador.
        </p>
        <Button render={<Link href="/cursos" />}>
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}
