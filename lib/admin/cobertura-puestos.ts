import { prisma } from "@/lib/prisma";
import type { AlertaCobertura } from "@/lib/tareas/validacion-cobertura";

export interface PuestoConDiagnostico {
  puestoId: string;
  nombre: string;
  area: string;
  cantidadUsers: number;
  usuariosNombres: string[];
  cantidadKpisDefinidos: number;
  alertas: AlertaCobertura[];
}

export interface WorkflowConDiagnostico {
  plantillaId: string;
  nombre: string;
  totalTareas: number;
  puestosRequeridos: string[];
  tareasSinAsignar: number;
  estado: "OK" | "WARNING" | "ERROR";
}

export interface DiagnosticoCobertura {
  puestos: PuestoConDiagnostico[];
  workflows: WorkflowConDiagnostico[];
}

export async function obtenerDiagnosticoCompleto(): Promise<DiagnosticoCobertura> {
  const puestos = await prisma.puesto.findMany({
    include: {
      area: true,
      _count: { select: { kpiDefiniciones: { where: { activa: true } } } },
    },
    orderBy: [{ area: { nombre: "asc" } }, { nombre: "asc" }],
  });

  const puestosConDiagnostico: PuestoConDiagnostico[] = [];

  for (const puesto of puestos) {
    const usuarios = await prisma.user.findMany({
      where: { puestoId: puesto.id, activo: true },
      select: { id: true, nombre: true, apellido: true },
    });

    const alertas: AlertaCobertura[] = [];

    if (usuarios.length === 0) {
      alertas.push({
        tipo: "PUESTO_SIN_USUARIO",
        severidad: "ERROR",
        mensaje: "Sin usuarios activos asignados",
      });
    }

    if (puesto._count.kpiDefiniciones === 0) {
      alertas.push({
        tipo: "PUESTO_SIN_KPIS",
        severidad: "WARNING",
        mensaje: "Sin KPIs definidos",
      });
    }

    if (usuarios.length > 1) {
      alertas.push({
        tipo: "TAREAS_SIN_RESPONSABLE",
        severidad: "WARNING",
        mensaje: `${usuarios.length} usuarios con este puesto — tareas asignadas al más antiguo`,
      });
    }

    puestosConDiagnostico.push({
      puestoId: puesto.id,
      nombre: puesto.nombre,
      area: puesto.area?.nombre ?? "Sin área",
      cantidadUsers: usuarios.length,
      usuariosNombres: usuarios.map((u) => `${u.nombre} ${u.apellido}`),
      cantidadKpisDefinidos: puesto._count.kpiDefiniciones,
      alertas,
    });
  }

  const plantillas = await prisma.workflowPlantilla.findMany({
    where: { activo: true },
    include: {
      tareas: {
        include: {
          catalogoTarea: { include: { rolResponsable: true } },
        },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const workflows: WorkflowConDiagnostico[] = [];
  for (const p of plantillas) {
    const puestosMap = new Map<string, string>();
    for (const t of p.tareas) {
      puestosMap.set(
        t.catalogoTarea.rolResponsableId,
        t.catalogoTarea.rolResponsable.nombre,
      );
    }

    let sinAsignar = 0;
    for (const [puestoId] of puestosMap.entries()) {
      const cantUsers = await prisma.user.count({
        where: { puestoId, activo: true },
      });
      if (cantUsers === 0) {
        sinAsignar += p.tareas.filter(
          (t) => t.catalogoTarea.rolResponsableId === puestoId,
        ).length;
      }
    }

    const estado: "OK" | "WARNING" | "ERROR" =
      sinAsignar === 0
        ? "OK"
        : sinAsignar < p.tareas.length
          ? "WARNING"
          : "ERROR";

    workflows.push({
      plantillaId: p.id,
      nombre: p.nombre,
      totalTareas: p.tareas.length,
      puestosRequeridos: Array.from(puestosMap.values()),
      tareasSinAsignar: sinAsignar,
      estado,
    });
  }

  return { puestos: puestosConDiagnostico, workflows };
}
