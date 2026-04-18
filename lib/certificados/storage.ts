import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function subirCertificado(params: {
  userId: string;
  certificadoId: string;
  buffer: Buffer;
}): Promise<string> {
  const supabase = getServiceSupabase();
  const path = `${params.userId}/${params.certificadoId}.pdf`;

  const { error } = await supabase.storage
    .from("certificados")
    .upload(path, params.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw new Error(`Error subiendo certificado: ${error.message}`);
  return path;
}

export async function obtenerUrlFirmadaCertificado(
  path: string,
  expiresInSeconds = 300
): Promise<string> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase.storage
    .from("certificados")
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Error generando URL firmada: ${error?.message}`);
  }

  return data.signedUrl;
}
