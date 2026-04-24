import { GlassCard } from "@/components/ui/primitives/GlassCard";

export function LeyendaTipos() {
  return (
    <GlassCard className="p-4">
      <p className="text-sm font-medium mb-3">Cómo funcionan tus KPIs</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex gap-3">
          <span className="text-xl flex-shrink-0">🤖</span>
          <div>
            <p className="font-medium">Auto-calculado</p>
            <p className="text-xs text-muted-foreground">
              El sistema lo calcula solo. No necesitas hacer nada.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-xl flex-shrink-0">📝</span>
          <div>
            <p className="font-medium">Tú reportas</p>
            <p className="text-xs text-muted-foreground">
              Reportas el valor semanalmente. Tu jefe valida.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-xl flex-shrink-0">👤</span>
          <div>
            <p className="font-medium">Jefe reporta</p>
            <p className="text-xs text-muted-foreground">
              Tu jefe evalúa y reporta el valor.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
