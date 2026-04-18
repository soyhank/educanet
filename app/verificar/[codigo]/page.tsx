import { obtenerCertificadoPorCodigo } from "@/lib/certificados/verificacion";
import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return { title: `Verificar certificado ${codigo}` };
}

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const certificado = await obtenerCertificadoPorCodigo(codigo);

  if (!certificado) {
    return (
      <div className="mx-auto max-w-md text-center space-y-4">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Certificado no encontrado</h1>
        <p className="text-muted-foreground">
          El codigo <code className="rounded bg-muted px-2 py-0.5">{codigo}</code> no
          corresponde a ningun certificado emitido por Educanet.
        </p>
        <p className="text-sm text-muted-foreground">
          Verifica que el codigo este escrito correctamente.
        </p>
      </div>
    );
  }

  const fecha = new Date(certificado.fechaEmision).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-success" />
      <div>
        <h1 className="text-2xl font-bold">Certificado verificado</h1>
        <p className="text-muted-foreground">
          Este certificado es autentico y fue emitido por Educanet
        </p>
      </div>

      <Card className="p-6 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Otorgado a</span>
          <span className="font-medium">{certificado.nombreCompleto}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Curso</span>
          <span className="font-medium">{certificado.cursoTitulo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Horas</span>
          <span className="font-medium">{certificado.horasEquivalentes}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Fecha</span>
          <span className="font-medium">{fecha}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Instructor</span>
          <span className="font-medium">{certificado.instructorNombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Codigo</span>
          <code className="rounded bg-muted px-2 py-0.5 text-xs">
            {certificado.codigoVerificacion}
          </code>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Verificado el{" "}
        {new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
