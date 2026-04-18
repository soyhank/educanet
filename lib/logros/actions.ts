"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleMostrarEnRanking(valor: boolean) {
  const user = await requireAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: { mostrarEnRanking: valor },
  });
  revalidatePath("/logros");
}
