import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Unete a Educanet
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea tu cuenta y comienza tu camino de crecimiento profesional
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
