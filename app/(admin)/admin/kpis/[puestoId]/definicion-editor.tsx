"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Save, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actualizarDefinicionKpi,
  crearDefinicionKpi,
  eliminarDefinicionKpi,
} from "@/lib/kpis/actions";

type Def = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  peso: number;
  tipoMeta: "ABSOLUTA" | "RELATIVA_BASELINE" | "BINARIA";
  valorObjetivoDefault: number | null;
  bonusPorcentaje: number;
  activa: boolean;
};

export function DefinicionEditor({
  puestoId,
  definiciones,
}: {
  puestoId: string;
  definiciones: Def[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Def, "id" | "activa">>({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidad: "%",
    peso: 10,
    tipoMeta: "ABSOLUTA",
    valorObjetivoDefault: null,
    bonusPorcentaje: 15,
  });

  const guardar = (id: string, data: Partial<Def>) => {
    startTransition(async () => {
      const res = await actualizarDefinicionKpi(id, data);
      if (res.success) {
        toast.success("Guardado");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const eliminar = (id: string) => {
    if (!confirm("Eliminar esta definicion? No se puede deshacer.")) return;
    startTransition(async () => {
      const res = await eliminarDefinicionKpi(id);
      if (res.success) {
        toast.success("Eliminada");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const crear = () => {
    if (!nuevo.codigo || !nuevo.nombre) {
      toast.error("Codigo y nombre son obligatorios");
      return;
    }
    startTransition(async () => {
      const res = await crearDefinicionKpi({
        puestoId,
        ...nuevo,
        valorObjetivoDefault: nuevo.valorObjetivoDefault ?? undefined,
      });
      if (res.success) {
        toast.success("Creada");
        setNuevoAbierto(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {definiciones.map((d) => (
        <FilaDef
          key={d.id}
          def={d}
          onGuardar={(data) => guardar(d.id, data)}
          onEliminar={() => eliminar(d.id)}
          disabled={isPending}
        />
      ))}

      {nuevoAbierto ? (
        <div className="space-y-3 rounded-lg border border-dashed bg-muted/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Codigo (ej. ROAS_CAMPANAS)"
              value={nuevo.codigo}
              onChange={(e) =>
                setNuevo({ ...nuevo, codigo: e.target.value.toUpperCase() })
              }
            />
            <Input
              placeholder="Nombre"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Descripcion"
            value={nuevo.descripcion}
            onChange={(e) =>
              setNuevo({ ...nuevo, descripcion: e.target.value })
            }
            rows={2}
          />
          <div className="grid gap-2 sm:grid-cols-4">
            <Input
              placeholder="Unidad (%, S/, piezas)"
              value={nuevo.unidad}
              onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Peso (0-100)"
              value={nuevo.peso}
              onChange={(e) =>
                setNuevo({ ...nuevo, peso: parseInt(e.target.value) || 0 })
              }
            />
            <Select
              value={nuevo.tipoMeta}
              onValueChange={(v) =>
                setNuevo({ ...nuevo, tipoMeta: v as Def["tipoMeta"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABSOLUTA">Absoluta</SelectItem>
                <SelectItem value="RELATIVA_BASELINE">
                  Relativa a baseline
                </SelectItem>
                <SelectItem value="BINARIA">Binaria (si/no)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="any"
              placeholder="Objetivo default"
              value={nuevo.valorObjetivoDefault ?? ""}
              onChange={(e) =>
                setNuevo({
                  ...nuevo,
                  valorObjetivoDefault: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNuevoAbierto(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={crear} disabled={isPending}>
              Crear
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNuevoAbierto(true)}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          Nueva definicion
        </Button>
      )}
    </div>
  );
}

function FilaDef({
  def,
  onGuardar,
  onEliminar,
  disabled,
}: {
  def: Def;
  onGuardar: (data: Partial<Def>) => void;
  onEliminar: () => void;
  disabled: boolean;
}) {
  const [editable, setEditable] = useState(def);

  const cambio =
    editable.nombre !== def.nombre ||
    editable.descripcion !== def.descripcion ||
    editable.unidad !== def.unidad ||
    editable.peso !== def.peso ||
    editable.valorObjetivoDefault !== def.valorObjetivoDefault ||
    editable.bonusPorcentaje !== def.bonusPorcentaje ||
    editable.activa !== def.activa;

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_100px_80px_80px_40px]">
        <Input
          value={editable.nombre}
          onChange={(e) =>
            setEditable({ ...editable, nombre: e.target.value })
          }
        />
        <Input
          value={editable.unidad}
          onChange={(e) =>
            setEditable({ ...editable, unidad: e.target.value })
          }
        />
        <Input
          type="number"
          value={editable.peso}
          onChange={(e) =>
            setEditable({
              ...editable,
              peso: parseInt(e.target.value) || 0,
            })
          }
        />
        <Input
          type="number"
          step="any"
          value={editable.valorObjetivoDefault ?? ""}
          onChange={(e) =>
            setEditable({
              ...editable,
              valorObjetivoDefault: e.target.value
                ? Number(e.target.value)
                : null,
            })
          }
          placeholder="—"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEliminar}
          disabled={disabled}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      <Textarea
        rows={2}
        value={editable.descripcion}
        onChange={(e) =>
          setEditable({ ...editable, descripcion: e.target.value })
        }
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {def.codigo} · {def.tipoMeta} · Bonus {def.bonusPorcentaje}%
        </div>
        {cambio && (
          <Button
            size="sm"
            onClick={() =>
              onGuardar({
                nombre: editable.nombre,
                descripcion: editable.descripcion,
                unidad: editable.unidad,
                peso: editable.peso,
                valorObjetivoDefault: editable.valorObjetivoDefault,
                bonusPorcentaje: editable.bonusPorcentaje,
                activa: editable.activa,
              })
            }
            disabled={disabled}
          >
            <Save className="mr-1 h-3 w-3" />
            Guardar cambios
          </Button>
        )}
      </div>
    </div>
  );
}
