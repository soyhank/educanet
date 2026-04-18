"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { crearCurso } from "@/lib/admin/cursos-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Area } from "@prisma/client";

export function CursoNuevoForm({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue } = useForm<{
    titulo: string;
    descripcion: string;
    descripcionCorta: string;
    nivel: "BASICO" | "INTERMEDIO" | "AVANZADO";
    areaId: string;
    duracionMinutos: number;
    puntosRecompensa: number;
    instructorNombre: string;
  }>({
    defaultValues: {
      titulo: "",
      descripcion: "",
      descripcionCorta: "",
      nivel: "BASICO",
      areaId: "",
      duracionMinutos: 60,
      puntosRecompensa: 100,
      instructorNombre: "",
    },
  });

  const onSubmit = (data: {
    titulo: string;
    descripcion: string;
    descripcionCorta: string;
    nivel: "BASICO" | "INTERMEDIO" | "AVANZADO";
    areaId: string;
    duracionMinutos: number;
    puntosRecompensa: number;
    instructorNombre: string;
  }) => {
    startTransition(async () => {
      try {
        await crearCurso({ ...data, publicado: false });
        toast.success("Curso creado como borrador");
        router.push("/admin/cursos");
      } catch {
        toast.error("Error al crear curso");
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Titulo</Label>
          <Input id="titulo" {...register("titulo")} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcionCorta">Descripcion corta</Label>
          <Input id="descripcionCorta" {...register("descripcionCorta")} maxLength={160} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripcion completa</Label>
          <Textarea id="descripcion" {...register("descripcion")} required rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nivel</Label>
            <Select defaultValue="BASICO" onValueChange={(v) => { if (v) setValue("nivel", v as "BASICO" | "INTERMEDIO" | "AVANZADO"); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BASICO">Basico</SelectItem>
                <SelectItem value="INTERMEDIO">Intermedio</SelectItem>
                <SelectItem value="AVANZADO">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Area</Label>
            <Select onValueChange={(v) => setValue("areaId", String(v ?? ""))}>
              <SelectTrigger><SelectValue placeholder="General" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">General</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duracion">Duracion (min)</Label>
            <Input id="duracion" type="number" {...register("duracionMinutos", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="puntos">Puntos</Label>
            <Input id="puntos" type="number" {...register("puntosRecompensa", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input id="instructor" {...register("instructorNombre")} required />
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear como borrador
        </Button>
      </form>
    </Card>
  );
}
