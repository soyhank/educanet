import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { estadisticasSemana } from "@/lib/compromisos/queries";

export async function CompromisosSemanaCard({ userId }: { userId: string }) {
  const stats = await estadisticasSemana(userId);

  if (stats.total === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          <p className="flex-1 text-sm text-muted-foreground">
            Sin compromisos esta semana. Tu jefe los asignara.
          </p>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/compromisos" />}
          >
            Proponer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Compromisos de la semana</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stats.cumplidos} de {stats.total} cumplidos ·{" "}
              {Math.round(stats.tasa)}% de cumplimiento
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/compromisos" />}
        >
          Ver detalle
        </Button>
      </div>

      <Progress value={stats.tasa} className="h-2" />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border bg-background/50 p-2">
          <p className="text-xs text-muted-foreground">Cumplidos</p>
          <p className="mt-0.5 text-lg font-semibold text-primary tabular-nums">
            {stats.cumplidos}
          </p>
        </div>
        <div className="rounded-md border bg-background/50 p-2">
          <p className="text-xs text-muted-foreground">En curso</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {stats.enCurso}
          </p>
        </div>
        <div className="rounded-md border bg-background/50 p-2">
          <p className="text-xs text-muted-foreground">Atrasados</p>
          <p className="mt-0.5 text-lg font-semibold text-destructive tabular-nums">
            {stats.fallados}
          </p>
        </div>
      </div>
    </div>
  );
}
