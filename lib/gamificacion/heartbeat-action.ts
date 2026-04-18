"use server";

import { createClient } from "@/lib/supabase/server";
import { registrarActividad } from "./rachas";

export async function heartbeatDiario() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const resultado = await registrarActividad(user.id);
  return resultado;
}
