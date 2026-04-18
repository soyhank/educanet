import React from "react";
import { enviarEmail } from "./cliente";

// Simple email templates using React.createElement (no JSX in .ts files)
function crearEmailSimple(titulo: string, mensaje: string, ctaTexto: string, ctaUrl: string) {
  return React.createElement("div", { style: { fontFamily: "Arial, sans-serif", maxWidth: 600, margin: "0 auto", padding: 40 } },
    React.createElement("div", { style: { textAlign: "center" as const, marginBottom: 24, color: "#0D9488", fontSize: 20, fontWeight: "bold" } }, "Educanet"),
    React.createElement("hr", { style: { border: "none", borderTop: "1px solid #E5E7EB", margin: "16px 0" } }),
    React.createElement("h1", { style: { fontSize: 24, color: "#1A1A1A", marginBottom: 8 } }, titulo),
    React.createElement("p", { style: { color: "#666", fontSize: 16, lineHeight: 1.6 } }, mensaje),
    React.createElement("div", { style: { textAlign: "center" as const, margin: "32px 0" } },
      React.createElement("a", {
        href: ctaUrl,
        style: { backgroundColor: "#0D9488", color: "white", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" },
      }, ctaTexto)
    ),
    React.createElement("hr", { style: { border: "none", borderTop: "1px solid #E5E7EB", margin: "32px 0 16px" } }),
    React.createElement("p", { style: { color: "#999", fontSize: 12, textAlign: "center" as const } }, "Educanet — Tu plataforma de crecimiento profesional")
  );
}

export async function enviarEmailCertificado(params: {
  destinatarioEmail: string;
  destinatarioNombre: string;
  cursoTitulo: string;
  codigoVerificacion: string;
  pdfBuffer: Buffer;
  nombreArchivoPdf: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return enviarEmail({
    to: params.destinatarioEmail,
    subject: `Tu certificado de ${params.cursoTitulo}`,
    react: crearEmailSimple(
      `Felicidades, ${params.destinatarioNombre}!`,
      `Has completado exitosamente el curso "${params.cursoTitulo}". Tu certificado oficial esta adjunto a este correo. Codigo de verificacion: ${params.codigoVerificacion}`,
      "Ver mis certificados",
      `${appUrl}/certificados`
    ),
    attachments: [{ filename: params.nombreArchivoPdf, content: params.pdfBuffer }],
  });
}

export async function enviarEmailBienvenida(params: {
  email: string;
  nombre: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return enviarEmail({
    to: params.email,
    subject: "Bienvenid@ a Educanet",
    react: crearEmailSimple(
      `Bienvenid@, ${params.nombre}!`,
      "Tu espacio de crecimiento profesional esta listo. Comienza con la induccion para conocer la empresa y explorar los cursos disponibles.",
      "Empezar ahora",
      `${appUrl}/cursos`
    ),
  });
}

export async function enviarEmailSubidaNivel(params: {
  email: string;
  nombre: string;
  nuevoNivel: number;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return enviarEmail({
    to: params.email,
    subject: `Has subido al nivel ${params.nuevoNivel}!`,
    react: crearEmailSimple(
      `Nivel ${params.nuevoNivel} alcanzado!`,
      `${params.nombre}, tu esfuerzo te ha llevado al nivel ${params.nuevoNivel}. Sigue asi para seguir creciendo.`,
      "Ver mis logros",
      `${appUrl}/logros`
    ),
  });
}
