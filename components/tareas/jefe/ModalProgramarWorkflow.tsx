"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { crearWorkflow, validarCoberturaAction } from "@/lib/tareas/actions";
import type { CoberturaWorkflow } from "@/lib/tareas/validacion-cobertura";

type Plantilla = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  duracionTotalDias: number;
  _count: { tareas: number };
};

export function ModalProgramarWorkflow({
  plantillas,
  currentUserId,
  areaId,
}: {
  plantillas: Plantilla[];
  currentUserId: string;
  areaId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plantillaId, setPlantillaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [contextoMarca, setContextoMarca] = useState("");
  const [fechaHito, setFechaHito] = useState("");
  const [isPending, startTransition] = useTransition();
  const [cobertura, setCobertura] = useState<CoberturaWorkflow | null>(null);
  const [validando, setValidando] = useState(false);

  const plantillaSel = plantillas.find((p) => p.id === plantillaId);

  useEffect(() => {
    if (!plantillaId || !areaId) {
      setCobertura(null);
      return;
    }
    setValidando(true);
    validarCoberturaAction({ plantillaId, areaId })
      .then(setCobertura)
      .finally(() => setValidando(false));
  }, [plantillaId, areaId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantillaId || !nombre.trim() || !fechaHito) return;
    if (cobertura && !cobertura.puedeCrearse) return;

    startTransition(async () => {
      const res = await crearWorkflow({
        plantillaId,
        nombre: nombre.trim(),
        contextoMarca: contextoMarca.trim() || undefined,
        fechaHito: new Date(fechaHito),
        responsableGeneralId: currentUserId,
        areaId,
      });

      if (!res.success) {
        toast.error(res.error ?? "Error");
        return;
      }

      const omitidas = res.data?.tareasOmitidas.length ?? 0;
      toast.success(
        `${res.data?.tareasCreadas ?? 0} tareas creadas${omitidas > 0 ? ` · ${omitidas} omitidas (sin usuario con rol)` : ""}`,
      );
      setOpen(false);
      setPlantillaId("");
      setNombre("");
      setContextoMarca("");
      setFechaHito("");
      setCobertura(null);
      router.refresh();
    });
  };

  const errores = cobertura?.alertas.filter((a) => a.severidad === "ERROR") ?? [];
  const advertencias = cobertura?.alertas.filter((a) => a.severidad === "WARNING") ?? [];
  const puedeCrear = !cobertura || cobertura.puedeCrearse;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Programar workflow
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar nuevo workflow</DialogTitle>
          <DialogDescription>
            Al confirmar, las tareas de la plantilla se auto-asignan a los
            responsables del equipo según su rol.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plantilla">Plantilla</Label>
            <Select value={plantillaId} onValueChange={(v) => setPlantillaId(v ?? "")}>
              <SelectTrigger id="plantilla">
                <SelectValue placeholder="Elegí una plantilla" />
              </SelectTrigger>
              <SelectContent>
                {plantillas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} ({p._count.tareas} tareas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {plantillaSel && (
              <p className="text-xs text-muted-foreground">
                {plantillaSel.descripcion} · {plantillaSel.duracionTotalDias} días
              </p>
            )}
          </div>

          {/* Preview de cobertura */}
          {plantillaId && (
            <div className="space-y-2">
              {validando && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Verificando cobertura del equipo…
                </p>
              )}
              {!validando && cobertura && (
                <>
                  {errores.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{a.mensaje}</span>
                    </div>
                  ))}
                  {advertencias.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                      <span>{a.mensaje}</span>
                    </div>
                  ))}
                  {cobertura.puedeCrearse && cobertura.alertas.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      ✓ {cobertura.totalAsignables} de {cobertura.totalTareas} tareas se asignarán correctamente
                    </p>
                  )}
                  {cobertura.puedeCrearse && cobertura.alertas.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {cobertura.totalAsignables} de {cobertura.totalTareas} tareas se asignarán correctamente
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del workflow</Label>
            <Input
              id="nombre"
              placeholder="Ej: Webinar Autodesk - Mayo 2026"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca / contexto (opcional)</Label>
            <Input
              id="marca"
              placeholder="Ej: Autodesk, Ansys, Oracle"
              value={contextoMarca}
              onChange={(e) => setContextoMarca(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha del hito (webinar)</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaHito}
              onChange={(e) => setFechaHito(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !plantillaId || validando || !puedeCrear}
              className={cn(!puedeCrear && "opacity-50")}
            >
              {isPending ? "Creando…" : "Crear workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
