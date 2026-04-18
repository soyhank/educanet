import { clasificarDesempeno } from "@/lib/desempeno/calculos";

export function DesempenoHeader({
  porcentajeCumplimiento,
}: {
  porcentajeCumplimiento: number;
}) {
  const clasificacion = clasificarDesempeno(porcentajeCumplimiento);

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Mi desempeno</h1>
      <p className="text-muted-foreground">
        {porcentajeCumplimiento > 0
          ? clasificacion.mensaje
          : "Aqui veras el progreso de tus metricas cuando RRHH las registre."}
      </p>
    </div>
  );
}
