import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

const TAREAS_GENERICAS = [
  {
    nombreAdHoc: "Completa tu perfil de usuario",
    descripcionAdHoc:
      "Agrega tu foto, bio y revisa que tus datos estén al día en la sección Perfil.",
    puntosBaseAdHoc: 5,
    tiempoEstimadoMinAdHoc: 10,
    tiempoEstimadoMaxAdHoc: 20,
  },
  {
    nombreAdHoc: "Conoce la plataforma Educanet",
    descripcionAdHoc:
      "Explora el dashboard, revisa tus cursos disponibles y familiarízate con el sistema.",
    puntosBaseAdHoc: 5,
    tiempoEstimadoMinAdHoc: 15,
    tiempoEstimadoMaxAdHoc: 30,
  },
  {
    nombreAdHoc: "Coordina tus objetivos del mes con tu jefe",
    descripcionAdHoc:
      "Agenda una reunión de 15 min con tu jefe para revisar los KPIs y prioridades del mes.",
    puntosBaseAdHoc: 10,
    tiempoEstimadoMinAdHoc: 15,
    tiempoEstimadoMaxAdHoc: 30,
  },
];

export async function asignarTareasOnboarding(
  userId: string,
  puestoId: string,
): Promise<void> {
  const hoy = new Date();
  const finDefault = addDays(hoy, 7);

  const tareasCatalogo = await prisma.catalogoTarea.findMany({
    where: { rolResponsableId: puestoId, activa: true },
    orderBy: { orden: "asc" },
  });

  if (tareasCatalogo.length > 0) {
    await prisma.tareaInstancia.createMany({
      data: tareasCatalogo.map((tarea) => ({
        catalogoTareaId: tarea.id,
        asignadoAId: userId,
        origen: "ASIGNADA_JEFE" as const,
        fechaEstimadaInicio: hoy,
        fechaEstimadaFin: finDefault,
        puntosBrutos: tarea.puntosBase,
        requiereValidacionJefe: true,
      })),
      skipDuplicates: true,
    });
    return;
  }

  // Fallback: generic onboarding tasks for puestos without catalog tasks
  await prisma.tareaInstancia.createMany({
    data: TAREAS_GENERICAS.map((t) => ({
      asignadoAId: userId,
      origen: "ASIGNADA_JEFE" as const,
      fechaEstimadaInicio: hoy,
      fechaEstimadaFin: finDefault,
      puntosBrutos: t.puntosBaseAdHoc,
      ...t,
    })),
    skipDuplicates: true,
  });
}
