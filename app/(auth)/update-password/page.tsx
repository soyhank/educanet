import { UpdatePasswordForm } from "./update-password-form";

export const metadata = { title: "Nueva contrasena" };

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Nueva contrasena
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu nueva contrasena
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
