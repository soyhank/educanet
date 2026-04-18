import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Restablecer contrasena" };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Restablecer contrasena
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
