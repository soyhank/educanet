import { prisma } from "@/lib/prisma";

export type CertificadoVerificacion = {
  codigoVerificacion: string;
  nombreCompleto: string;
  cursoTitulo: string;
  cursoDescripcion: string | null;
  instructorNombre: string;
  fechaEmision: Date;
  horasEquivalentes: number;
};

export async function obtenerCertificadoPorCodigo(
  codigo: string
): Promise<CertificadoVerificacion | null> {
  const codigoNormalizado = codigo.trim().toUpperCase();

  const cert = await prisma.certificado.findUnique({
    where: { codigoVerificacion: codigoNormalizado },
    include: {
      user: { select: { nombre: true, apellido: true } },
      curso: {
        select: {
          titulo: true,
          descripcionCorta: true,
          instructorNombre: true,
        },
      },
    },
  });

  if (!cert) return null;

  return {
    codigoVerificacion: cert.codigoVerificacion,
    nombreCompleto: `${cert.user.nombre} ${cert.user.apellido}`,
    cursoTitulo: cert.curso.titulo,
    cursoDescripcion: cert.curso.descripcionCorta,
    instructorNombre: cert.curso.instructorNombre,
    fechaEmision: cert.fechaEmision,
    horasEquivalentes: cert.horasEquivalentes,
  };
}
