"use client";

import { useTransition } from "react";
import { Download, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { obtenerUrlDescargaCertificado } from "@/lib/certificados/actions";

export function CertificadoCard({
  id,
  cursoTitulo,
  fechaEmision,
  codigoVerificacion,
  horasEquivalentes,
  tienePdf,
}: {
  id: string;
  cursoTitulo: string;
  fechaEmision: Date;
  codigoVerificacion: string;
  horasEquivalentes: number;
  tienePdf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const fecha = new Date(fechaEmision).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const urlVerificacion = `${appUrl}/verificar/${codigoVerificacion}`;

  const handleDescargar = () => {
    startTransition(async () => {
      try {
        const url = await obtenerUrlDescargaCertificado(id);
        window.open(url, "_blank");
      } catch {
        toast.error("No se pudo descargar el certificado");
      }
    });
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(urlVerificacion);
    toast.success("Enlace de verificacion copiado");
  };

  return (
    <Card className="overflow-hidden">
      {/* Visual preview */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center border-b">
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Certificado
        </p>
        <p className="mt-2 font-semibold line-clamp-2">{cursoTitulo}</p>
        <p className="mt-1 text-xs text-muted-foreground">{fecha}</p>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{horasEquivalentes}h de formacion</span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {codigoVerificacion}
          </code>
        </div>

        <div className="flex gap-2">
          {tienePdf ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={handleDescargar}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Download className="mr-1 h-3 w-3" />
              )}
              Descargar
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              PDF pendiente
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={handleCopiar}>
            <Copy className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(urlVerificacion, "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
