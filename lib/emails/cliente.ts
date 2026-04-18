import { Resend } from "resend";
import type React from "react";

interface EnviarEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";
const resend =
  EMAIL_ENABLED && process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function enviarEmail(
  params: EnviarEmailParams
): Promise<{ success: boolean; mock?: boolean; error?: string }> {
  const from =
    process.env.EMAIL_FROM ?? "Educanet <noreply@educanet.local>";

  if (!resend) {
    console.log("\n========== [EMAIL MOCK] ==========");
    console.log(
      `To: ${Array.isArray(params.to) ? params.to.join(", ") : params.to}`
    );
    console.log(`Subject: ${params.subject}`);
    if (params.attachments?.length) {
      console.log(
        `Attachments: ${params.attachments.map((a) => a.filename).join(", ")}`
      );
    }
    console.log("===================================\n");
    return { success: true, mock: true };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      react: params.react,
      attachments: params.attachments,
    });

    if (error) {
      console.error("Error enviando email:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Error critico enviando email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
