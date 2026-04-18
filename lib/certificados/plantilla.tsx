import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Line,
} from "@react-pdf/renderer";

interface CertificadoPDFProps {
  nombreCompleto: string;
  cursoTitulo: string;
  cursoDescripcionCorta: string | null;
  fechaEmision: Date;
  horasEquivalentes: number;
  codigoVerificacion: string;
  qrDataUrl: string;
  instructorNombre: string;
  firmanteNombre: string;
  firmanteCargo: string;
  empresaNombre: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: "#0D9488",
    borderStyle: "solid",
  },
  innerBorder: {
    position: "absolute",
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderWidth: 0.5,
    borderColor: "#0D948840",
    borderStyle: "solid",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0D9488",
    letterSpacing: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#1A1A1A",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 30,
  },
  recipientLabel: {
    fontSize: 11,
    color: "#888888",
    textAlign: "center",
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
  },
  courseLabel: {
    fontSize: 11,
    color: "#888888",
    textAlign: "center",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0D9488",
    textAlign: "center",
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 30,
  },
  metaItem: {
    fontSize: 10,
    color: "#555555",
    textAlign: "center",
  },
  metaLabel: {
    fontSize: 8,
    color: "#999999",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
  },
  firma: {
    alignItems: "center",
    width: 200,
  },
  firmaLinea: {
    marginBottom: 4,
  },
  firmaNombre: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  firmaCargo: {
    fontSize: 9,
    color: "#888888",
  },
  qrSection: {
    alignItems: "center",
  },
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  codigoText: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#666666",
    textAlign: "center",
  },
  verifyText: {
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
    marginTop: 2,
  },
});

function formatFecha(fecha: Date): string {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CertificadoPDF(props: CertificadoPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Decorative borders */}
        <View style={styles.border} fixed />
        <View style={styles.innerBorder} fixed />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>{props.empresaNombre.toUpperCase()}</Text>

          <Svg width="100" height="2" viewBox="0 0 100 2" style={{ alignSelf: "center", marginBottom: 15 }}>
            <Line x1="0" y1="1" x2="100" y2="1" strokeWidth={1} stroke="#0D9488" />
          </Svg>

          <Text style={styles.title}>Certificado</Text>
          <Text style={styles.subtitle}>de finalizacion</Text>
        </View>

        {/* Recipient */}
        <Text style={styles.recipientLabel}>
          Se otorga el presente certificado a
        </Text>
        <Text style={styles.recipientName}>{props.nombreCompleto}</Text>

        <Svg width="200" height="2" viewBox="0 0 200 2" style={{ alignSelf: "center", marginBottom: 15 }}>
          <Line x1="0" y1="1" x2="200" y2="1" strokeWidth={0.5} stroke="#CCCCCC" />
        </Svg>

        {/* Course */}
        <Text style={styles.courseLabel}>
          por haber completado satisfactoriamente el curso
        </Text>
        <Text style={styles.courseTitle}>{props.cursoTitulo}</Text>
        {props.cursoDescripcionCorta && (
          <Text style={styles.courseDesc}>{props.cursoDescripcionCorta}</Text>
        )}

        {/* Meta */}
        <View style={styles.meta}>
          <View>
            <Text style={styles.metaLabel}>Horas</Text>
            <Text style={styles.metaItem}>{props.horasEquivalentes}h</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Fecha</Text>
            <Text style={styles.metaItem}>
              {formatFecha(props.fechaEmision)}
            </Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Instructor</Text>
            <Text style={styles.metaItem}>{props.instructorNombre}</Text>
          </View>
        </View>

        {/* Footer: signature + QR */}
        <View style={styles.footer}>
          <View style={styles.firma}>
            <Svg width="150" height="2" viewBox="0 0 150 2" style={styles.firmaLinea}>
              <Line x1="0" y1="1" x2="150" y2="1" strokeWidth={0.5} stroke="#333333" />
            </Svg>
            <Text style={styles.firmaNombre}>{props.firmanteNombre}</Text>
            <Text style={styles.firmaCargo}>{props.firmanteCargo}</Text>
          </View>

          <View style={styles.qrSection}>
            <Image src={props.qrDataUrl} style={styles.qrImage} />
            <Text style={styles.codigoText}>{props.codigoVerificacion}</Text>
            <Text style={styles.verifyText}>Escanea para verificar</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
