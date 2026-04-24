"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Clock } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { crearTareaAdHoc } from "@/lib/tareas/actions";
import { SelectorNegocio } from "./SelectorNegocio";
import type { Negocio } from "@prisma/client";

function calcularPuntos(tMin: number, tMax: number): number {
  const promedio = (tMin + tMax) / 2;
  return Math.min(20, Math.max(1, Math.round(promedio / 6)));
}

export function ModalNuevaAdHoc() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tiempoMin, setTiempoMin] = useState(15);
  const [tiempoMax, setTiempoMax] = useState(45);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [nuevoItem, setNuevoItem] = useState("");

  const nuevoItemRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const puntosEstimados = calcularPuntos(tiempoMin, tiempoMax);

  const reset = () => {
    setNombre("");
    setDescripcion("");
    setTiempoMin(15);
    setTiempoMax(45);
    setNegocio(null);
    setChecklistItems([]);
    setNuevoItem("");
  };

  const agregarItem = () => {
    const texto = nuevoItem.trim();
    if (!texto) return;
    setChecklistItems((prev) => [...prev, texto]);
    setNuevoItem("");
    nuevoItemRef.current?.focus();
  };

  const eliminarItem = (i: number) => {
    setChecklistItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }

    startTransition(async () => {
      const res = await crearTareaAdHoc({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        tiempoEstimadoMinAdHoc: tiempoMin,
        tiempoEstimadoMaxAdHoc: tiempoMax,
        negocio,
        checklistAdHoc: checklistItems.length > 0 ? checklistItems : undefined,
      });

      if (!res.success) {
        toast.error(res.error ?? "Error");
        return;
      }
      toast.success(
        `Tarea registrada · ${res.data?.puntosAsignados ?? puntosEstimados} pts estimados · tu jefe la valida al completarla`,
      );
      setOpen(false);
      reset();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="subtle">
            <Plus />
            Nueva tarea
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar tarea ad-hoc</DialogTitle>
          <DialogDescription>
            Registrá algo que hiciste fuera del catálogo. Tu jefe la valida al
            completarla y puede ajustar los puntos.
          </DialogDescription>
        </DialogHeader>

        {/* form is a direct grid child — scrollable, no footer inside */}
        <form
          id="adhoc-form"
          onSubmit={onSubmit}
          className="max-h-[60vh] overflow-y-auto space-y-4 py-2 pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="n">Nombre</Label>
            <Input
              id="n"
              placeholder="Ej: Responder a lead urgente del cliente Autodesk"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="d">Descripción (opcional)</Label>
            <Textarea
              id="d"
              rows={2}
              placeholder="Qué hiciste y por qué"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neg">Negocio / marca</Label>
            <SelectorNegocio id="neg" value={negocio} onChange={setNegocio} />
          </div>

          <div className="space-y-2">
            <Label>Tiempo estimado</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mínimo (min)</p>
                <Input
                  id="tmin"
                  type="number"
                  min={1}
                  value={tiempoMin}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 1;
                    setTiempoMin(v);
                    if (tiempoMax < v) setTiempoMax(v);
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Máximo (min)</p>
                <Input
                  id="tmax"
                  type="number"
                  min={tiempoMin}
                  value={tiempoMax}
                  onChange={(e) =>
                    setTiempoMax(parseInt(e.target.value, 10) || tiempoMin)
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Puntos asignados automáticamente:{" "}
                <span className="font-semibold text-foreground">
                  {puntosEstimados} pts
                </span>{" "}
                · el jefe puede ajustarlos al validar
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Checklist de pasos (opcional)</Label>
            {checklistItems.length > 0 && (
              <ul className="space-y-1.5 rounded-md border bg-muted/20 p-2">
                {checklistItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded px-2 py-1 text-sm"
                  >
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    <span className="flex-1 text-foreground">{item}</span>
                    <button
                      type="button"
                      onClick={() => eliminarItem(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar paso"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                ref={nuevoItemRef}
                placeholder="Ej: Revisar plantilla antes de enviar"
                value={nuevoItem}
                onChange={(e) => setNuevoItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    agregarItem();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarItem}
                disabled={!nuevoItem.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enter para agregar · podés añadir más pasos desde la vista de la
              tarea
            </p>
          </div>

          <div className="rounded-md bg-muted/30 p-3 text-xs text-muted-foreground">
            <strong>Importante:</strong> al completarla pasa a &ldquo;por
            validar&rdquo;. Los puntos se suman a tu mes solo cuando el jefe
            aprueba.
          </div>
        </form>

        {/* footer is a direct grid child — always visible, negative margins work correctly */}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="adhoc-form" disabled={isPending || !nombre.trim()}>
            {isPending ? "Registrando…" : "Registrar tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
