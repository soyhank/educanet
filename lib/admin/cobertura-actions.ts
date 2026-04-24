"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

export async function asignarKpisManualmenteAction(): Promise<{
  ok: boolean;
  usuariosProcesados?: number;
  totalAsignaciones?: number;
  error?: string;
}> {
  try {
    await requireRole(["ADMIN", "RRHH"]);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(
      `${appUrl}/api/cron/kpis-asignacion-mensual`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { ok: false, error: "Error ejecutando asignación" };
    }

    const data = await response.json();
    revalidatePath("/admin/cobertura");
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
