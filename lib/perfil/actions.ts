"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function actualizarPerfil(data: {
  nombre: string;
  apellido: string;
  bio?: string;
}) {
  const user = await requireAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: { nombre: data.nombre, apellido: data.apellido, bio: data.bio ?? null },
  });
  revalidatePath("/perfil");
  revalidatePath("/cursos");
}

export async function cambiarContrasena(actual: string, nueva: string) {
  const supabase = await createClient();

  // Verify current password
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "No se pudo obtener el usuario" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actual,
  });

  if (signInError) return { error: "Contrasena actual incorrecta" };

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: "Error al cambiar la contrasena" };

  return { ok: true };
}

export async function actualizarPreferenciasNotificaciones(
  preferencias: Record<string, { app: boolean; email: boolean }>
) {
  const user = await requireAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: { preferenciasEmail: preferencias },
  });
  revalidatePath("/perfil");
}

export async function toggleMostrarEnRanking(valor: boolean) {
  const user = await requireAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: { mostrarEnRanking: valor },
  });
  revalidatePath("/perfil");
  revalidatePath("/logros");
}

export async function subirAvatar(formData: FormData) {
  const user = await requireAuth();
  const file = formData.get("avatar") as File;
  if (!file) return { error: "No se recibio archivo" };

  if (file.size > 2 * 1024 * 1024) return { error: "Maximo 2MB" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("avatares")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) return { error: `Error subiendo: ${error.message}` };

  const { data: urlData } = supabase.storage.from("avatares").getPublicUrl(path);
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: urlData.publicUrl },
  });

  revalidatePath("/perfil");
  revalidatePath("/cursos");
  return { ok: true, url: urlData.publicUrl };
}
