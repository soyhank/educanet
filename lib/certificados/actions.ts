"use server";

import { requireAuth, esAdministrativo } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerUrlFirmadaCertificado } from "./storage";

export async function obtenerUrlDescargaCertificado(
  certificadoId: string
): Promise<string> {
  const user = await requireAuth();

  const certificado = await prisma.certificado.findUnique({
    where: { id: certificadoId },
  });

  if (!certificado) throw new Error("Certificado no encontrado");
  if (certificado.userId !== user.id && !esAdministrativo(user)) {
    throw new Error("No autorizado");
  }
  if (!certificado.urlPdf) {
    throw new Error("PDF no disponible aun");
  }

  return obtenerUrlFirmadaCertificado(certificado.urlPdf, 300);
}
