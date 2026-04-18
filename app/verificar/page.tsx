import { VerificarForm } from "./verificar-form";

export const metadata = { title: "Verificar certificado" };

export default function VerificarPage() {
  return (
    <div className="mx-auto max-w-md text-center space-y-6">
      <h1 className="text-2xl font-bold">Verificar certificado</h1>
      <p className="text-muted-foreground">
        Ingresa el codigo de verificacion que aparece en el certificado
      </p>
      <VerificarForm />
    </div>
  );
}
