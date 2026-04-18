import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import React from "react";
import { CertificadoPDF } from "./plantilla";

export async function generarPDFCertificado(params: {
  certificadoId: string;
  nombreCompleto: string;
  cursoTitulo: string;
  cursoDescripcionCorta: string | null;
  fechaEmision: Date;
  horasEquivalentes: number;
  codigoVerificacion: string;
  instructorNombre: string;
}): Promise<Buffer> {
  const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar/${params.codigoVerificacion}`;

  const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
    width: 300,
    margin: 0,
    color: { dark: "#0A0A0A", light: "#FFFFFF" },
  });

  const element = React.createElement(CertificadoPDF, {
    ...params,
    qrDataUrl,
    firmanteNombre: process.env.FIRMANTE_NOMBRE ?? "Jefe de RRHH",
    firmanteCargo: process.env.FIRMANTE_CARGO ?? "Recursos Humanos",
    empresaNombre: process.env.EMPRESA_NOMBRE ?? "Educanet",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
