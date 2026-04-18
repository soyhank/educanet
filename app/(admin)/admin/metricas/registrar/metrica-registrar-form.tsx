"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { registrarMetrica } from "@/lib/desempeno/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Usuario = { id: string; nombre: string; apellido: string; email: string };

export function MetricaRegistrarForm({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hoy = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, setValue } = useForm<{
    userId: string;
    tipo: string;
    nombre: string;
    descripcion: string;
    valor: number;
    objetivo: number;
    unidad: string;
    periodo: "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
    fechaInicio: string;
    fechaFin: string;
  }>({
    defaultValues: {
      userId: "",
      tipo: "",
      nombre: "",
      descripcion: "",
      valor: 0,
      objetivo: 100,
      unidad: "%",
      periodo: "TRIMESTRAL",
      fechaInicio: hoy,
      fechaFin: hoy,
    },
  });

  const onSubmit = (data: {
    userId: string;
    tipo: string;
    nombre: string;
    descripcion: string;
    valor: number;
    objetivo: number;
    unidad: string;
    periodo: "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
    fechaInicio: string;
    fechaFin: string;
  }) => {
    startTransition(async () => {
      try {
        await registrarMetrica({
          userId: data.userId,
          tipo: data.tipo,
          nombre: data.nombre,
          descripcion: data.descripcion,
          valor: data.valor,
          objetivo: data.objetivo,
          unidad: data.unidad,
          periodo: data.periodo,
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
        });
        toast.success("Metrica registrada");
        router.push("/admin/metricas");
      } catch {
        toast.error("Error al registrar metrica");
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Usuario</Label>
          <Select onValueChange={(v) => setValue("userId", String(v ?? ""))}>
            <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
            <SelectContent>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} ({u.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Input id="tipo" {...register("tipo")} placeholder="ventas, marketing..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} placeholder="Cuota de ventas" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripcion</Label>
          <Input id="descripcion" {...register("descripcion")} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor actual</Label>
            <Input id="valor" type="number" step="0.01" {...register("valor", { valueAsNumber: true })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input id="objetivo" type="number" step="0.01" {...register("objetivo", { valueAsNumber: true })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Input id="unidad" {...register("unidad")} placeholder="%" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Periodo</Label>
            <Select defaultValue="TRIMESTRAL" onValueChange={(v) => { if (v) setValue("periodo", v as "TRIMESTRAL"); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MENSUAL">Mensual</SelectItem>
                <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                <SelectItem value="ANUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha inicio</Label>
            <Input id="fechaInicio" type="date" {...register("fechaInicio")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha fin</Label>
            <Input id="fechaFin" type="date" {...register("fechaFin")} required />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar metrica
        </Button>
      </form>
    </Card>
  );
}
