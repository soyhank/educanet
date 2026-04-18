"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { otorgarPuntos } from "@/lib/gamificacion/puntos";
import { verificarBadges } from "@/lib/gamificacion/badges";
import { registrarActividad } from "@/lib/gamificacion/rachas";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { generarPDFCertificado } from "@/lib/certificados/generador";
import { subirCertificado } from "@/lib/certificados/storage";
import { enviarEmailCertificado } from "@/lib/emails/servicios";

function generarCodigoVerificacion(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  const blocks = [];
  for (let b = 0; b < 3; b++) {
    let block = "";
    for (let i = 0; i < 4; i++) {
      block += chars[bytes[b * 4 + i] % chars.length];
    }
    blocks.push(block);
  }
  return `EDU-${blocks.join("-")}`;
}

export async function marcarLeccionCompletada(leccionId: string) {
  const user = await requireAuth();

  const leccion = await prisma.leccion.findUnique({
    where: { id: leccionId },
    select: {
      puntosRecompensa: true,
      modulo: {
        select: {
          cursoId: true,
          curso: {
            select: {
              id: true,
              slug: true,
              titulo: true,
              descripcionCorta: true,
              puntosRecompensa: true,
              duracionMinutos: true,
              instructorNombre: true,
            },
          },
        },
      },
    },
  });

  if (!leccion) return { error: "Leccion no encontrada" };

  // Upsert progress
  await prisma.progresoLeccion.upsert({
    where: { userId_leccionId: { userId: user.id, leccionId } },
    update: { completada: true, porcentajeVisto: 100, fechaCompletada: new Date() },
    create: {
      userId: user.id,
      leccionId,
      completada: true,
      porcentajeVisto: 100,
      fechaCompletada: new Date(),
    },
  });

  // Award lesson points
  const resultado = await otorgarPuntos({
    userId: user.id,
    cantidad: leccion.puntosRecompensa,
    razon: "COMPLETAR_LECCION",
    descripcion: "Leccion completada",
    referenciaId: leccionId,
  });

  // Check if entire course is now complete
  let cursoCompleto = false;
  const curso = leccion.modulo.curso;

  const totalLecciones = await prisma.leccion.count({
    where: { modulo: { cursoId: curso.id } },
  });
  const completadas = await prisma.progresoLeccion.count({
    where: {
      userId: user.id,
      completada: true,
      leccion: { modulo: { cursoId: curso.id } },
    },
  });

  if (completadas >= totalLecciones) {
    cursoCompleto = true;

    // Award course completion bonus
    await otorgarPuntos({
      userId: user.id,
      cantidad: curso.puntosRecompensa,
      razon: "COMPLETAR_CURSO",
      descripcion: `Curso completado: ${curso.titulo}`,
      referenciaId: curso.id,
    });

    // Create certificate
    const existeCertificado = await prisma.certificado.findUnique({
      where: { userId_cursoId: { userId: user.id, cursoId: curso.id } },
    });

    if (!existeCertificado) {
      const codigoVerif = generarCodigoVerificacion();
      const horas = Math.ceil(curso.duracionMinutos / 60);

      const certificado = await prisma.certificado.create({
        data: {
          userId: user.id,
          cursoId: curso.id,
          codigoVerificacion: codigoVerif,
          horasEquivalentes: horas,
        },
      });

      await prisma.notificacion.create({
        data: {
          userId: user.id,
          tipo: "CERTIFICADO",
          titulo: "Certificado disponible!",
          mensaje: `Has completado ${curso.titulo}. Tu certificado esta listo.`,
          url: "/certificados",
        },
      });

      // Generate PDF + upload + email (fire-and-forget)
      generarYSubirCertificado({
        certificadoId: certificado.id,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.nombre} ${user.apellido}`,
        cursoTitulo: curso.titulo,
        cursoDescripcionCorta: curso.descripcionCorta ?? null,
        cursoSlug: curso.slug,
        fechaEmision: certificado.fechaEmision,
        horasEquivalentes: horas,
        codigoVerificacion: codigoVerif,
        instructorNombre: curso.instructorNombre,
      }).catch((err) => console.error("Error generando certificado PDF:", err));
    }
  }

  // Register activity for streak
  await registrarActividad(user.id);

  // Check for new badges
  const badgesDesbloqueados = await verificarBadges(user.id);

  revalidatePath(`/cursos/${curso.slug}`);
  revalidatePath("/cursos");
  revalidatePath("/logros");

  return {
    puntosGanados: leccion.puntosRecompensa,
    nuevoNivel: resultado.subioDeNivel ? resultado.nuevoNivel : undefined,
    cursoCompleto,
    badgesDesbloqueados,
  };
}

export async function actualizarProgresoVideo(
  leccionId: string,
  porcentaje: number
) {
  const user = await requireAuth();

  const existente = await prisma.progresoLeccion.findUnique({
    where: { userId_leccionId: { userId: user.id, leccionId } },
  });

  if (existente?.completada) return;

  await prisma.progresoLeccion.upsert({
    where: { userId_leccionId: { userId: user.id, leccionId } },
    update: { porcentajeVisto: porcentaje, fechaUltimaVista: new Date() },
    create: {
      userId: user.id,
      leccionId,
      porcentajeVisto: porcentaje,
    },
  });

  if (porcentaje >= 90 && !existente?.completada) {
    await marcarLeccionCompletada(leccionId);
  }
}

async function generarYSubirCertificado(params: {
  certificadoId: string;
  userId: string;
  userEmail: string;
  userName: string;
  cursoTitulo: string;
  cursoDescripcionCorta: string | null;
  cursoSlug: string;
  fechaEmision: Date;
  horasEquivalentes: number;
  codigoVerificacion: string;
  instructorNombre: string;
}) {
  const pdfBuffer = await generarPDFCertificado({
    certificadoId: params.certificadoId,
    nombreCompleto: params.userName,
    cursoTitulo: params.cursoTitulo,
    cursoDescripcionCorta: params.cursoDescripcionCorta,
    fechaEmision: params.fechaEmision,
    horasEquivalentes: params.horasEquivalentes,
    codigoVerificacion: params.codigoVerificacion,
    instructorNombre: params.instructorNombre,
  });

  const pdfPath = await subirCertificado({
    userId: params.userId,
    certificadoId: params.certificadoId,
    buffer: pdfBuffer,
  });

  await prisma.certificado.update({
    where: { id: params.certificadoId },
    data: { urlPdf: pdfPath },
  });

  const nombreArchivo = `Certificado-${params.cursoSlug}-${params.codigoVerificacion}.pdf`;

  await enviarEmailCertificado({
    destinatarioEmail: params.userEmail,
    destinatarioNombre: params.userName,
    cursoTitulo: params.cursoTitulo,
    codigoVerificacion: params.codigoVerificacion,
    pdfBuffer,
    nombreArchivoPdf: nombreArchivo,
  });
}
