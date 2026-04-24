"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { asignarKpisManualmenteAction } from "@/lib/admin/cobertura-actions";

export function BotonAsignarKpis() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await asignarKpisManualmenteAction();
      if (!res.ok) {
        toast.error(res.error ?? "Error ejecutando asignación");
      } else {
        toast.success(
          `KPIs asignados: ${res.totalAsignaciones} asignaciones a ${res.usuariosProcesados} usuarios`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={loading}>
      <Zap className="h-4 w-4" />
      {loading ? "Asignando…" : "Asignar KPIs ahora"}
    </Button>
  );
}
