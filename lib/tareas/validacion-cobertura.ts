import { prisma } from "@/lib/prisma";

export interface CoberturaWorkflow {
  puedeCrearse: boolean;
  alertas: AlertaCobertura[];
  totalTareas: number;
  totalAsignables: number;
  totalSinAsignar: number;
}

export interface AlertaCobertura {
  tipo: "PUESTO_SIN_USUARIO" | "PUESTO_SIN_KPIS" | "TAREAS_SIN_RESPONSABLE";
  severidad: "WARNING" | "ERROR";
  mensaje: string;
  contexto?: Record<string, unknown>;
}

export async function validarCoberturaWorkflow(params: {
  plantillaId: string;
  areaId: string;
}): Promise<CoberturaWorkflow> {
  const alertas: AlertaCobertura[] = [];

  const plantilla = await prisma.workflowPlantilla.findUnique({
    where: { id: params.plantillaId },
    include: {
      tareas: {
        include: {
          catalogoTarea: { include: { rolResponsable: true } },
        },
      },
    },
  });

  if (!plantilla) {
    return {
      puedeCrearse: false,
      alertas: [
        {
          tipo: "TAREAS_SIN_RESPONSABLE",
          severidad: "ERROR",
          mensaje: "Plantilla de workflow no encontrada",
        },
      ],
      totalTareas: 0,
      totalAsignables: 0,
      totalSinAsignar: 0,
    };
  }

  // Agrupar tareas por puesto requerido
  const puestosMap = new Map<
    string,
    { puestoId: string; nombre: string; cantidad: number }
  >();
  for (const t of plantilla.tareas) {
    const key = t.catalogoTarea.rolResponsableId;
    const entry = puestosMap.get(key) ?? {
      puestoId: key,
      nombre: t.catalogoTarea.rolResponsable.nombre,
      cantidad: 0,
    };
    entry.cantidad++;
    puestosMap.set(key, entry);
  }

  let totalAsignables = 0;
  let totalSinAsignar = 0;

  for (const [, info] of puestosMap.entries()) {
    const cantUsers = await prisma.user.count({
      where: { puestoId: info.puestoId, areaId: params.areaId, activo: true },
    });

    if (cantUsers === 0) {
      alertas.push({
        tipo: "PUESTO_SIN_USUARIO",
        severidad: "ERROR",
        mensaje: `No hay usuarios con puesto "${info.nombre}" en esta área`,
        contexto: {
          puestoId: info.puestoId,
          puestoNombre: info.nombre,
          tareasAfectadas: info.cantidad,
        },
      });
      totalSinAsignar += info.cantidad;
    } else {
      totalAsignables += info.cantidad;
      if (cantUsers > 1) {
        alertas.push({
          tipo: "TAREAS_SIN_RESPONSABLE",
          severidad: "WARNING",
          mensaje: `Hay ${cantUsers} usuarios con puesto "${info.nombre}". Las tareas se asignarán al más antiguo.`,
          contexto: { puestoNombre: info.nombre, cantidadUsers: cantUsers },
        });
      }
    }
  }

  return {
    puedeCrearse: totalSinAsignar === 0,
    alertas,
    totalTareas: plantilla.tareas.length,
    totalAsignables,
    totalSinAsignar,
  };
}
