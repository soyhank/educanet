"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { actualizarObjetivoRolMesAction } from "@/lib/kpis/actions";

type KpiDef = {
  id: string;
  nombre: string;
  unidad: string;
  valorObjetivoDefault: number | null;
  peso: number;
};

type PuestoConKpis = {
  id: string;
  nombre: string;
  kpiDefiniciones: KpiDef[];
};

export function EditorObjetivosRol({ puestos }: { puestos: PuestoConKpis[] }) {
  const [abierto, setAbierto] = useState<string | null>(null);

  const puestosConKpis = puestos.filter((p) => p.kpiDefiniciones.length > 0);

  if (puestosConKpis.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay puestos con KPIs definidos en tu área.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {puestosConKpis.map((puesto) => (
        <div key={puesto.id} className="rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setAbierto(abierto === puesto.id ? null : puesto.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{puesto.nombre}</span>
              <Badge variant="outline" className="text-[10px]">
                {puesto.kpiDefiniciones.length} KPIs
              </Badge>
            </div>
            <motion.span
              animate={{ rotate: abierto === puesto.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {abierto === puesto.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-2">
                  {puesto.kpiDefiniciones.map((kpi) => (
                    <FilaKpiObjetivo key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function FilaKpiObjetivo({ kpi }: { kpi: KpiDef }) {
  const [valor, setValor] = useState<string>(
    kpi.valorObjetivoDefault?.toString() ?? "",
  );
  const [isPending, startTransition] = useTransition();

  const original = kpi.valorObjetivoDefault?.toString() ?? "";
  const cambio = valor !== original && valor !== "";

  const guardar = () => {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
      toast.error("Valor inválido");
      return;
    }
    startTransition(async () => {
      const res = await actualizarObjetivoRolMesAction({
        definicionId: kpi.id,
        valorObjetivo: num,
      });
      if (res.success) {
        toast.success(`Objetivo actualizado · aplicado al mes actual`);
      } else {
        toast.error(res.error ?? "Error al guardar");
        setValor(original);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm">{kpi.nombre}</p>
        <p className="text-xs text-muted-foreground">Peso: {kpi.peso}%</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            step="any"
            min={0}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-24 h-8 text-sm text-right"
            disabled={isPending}
          />
          <span className="text-xs text-muted-foreground w-10 flex-shrink-0">
            {kpi.unidad}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={guardar}
          disabled={!cambio || isPending}
          className={cn("h-8 w-8 p-0", !cambio && "opacity-0 pointer-events-none")}
        >
          <Save className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
