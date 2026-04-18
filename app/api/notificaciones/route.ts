import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const notificaciones = await prisma.notificacion.findMany({
    where: { userId: user.id },
    orderBy: { fecha: "desc" },
    take: 10,
  });

  return NextResponse.json(notificaciones);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  await prisma.notificacion.update({
    where: { id, userId: user.id },
    data: { leida: true },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.notificacion.updateMany({
    where: { userId: user.id, leida: false },
    data: { leida: true },
  });

  return NextResponse.json({ ok: true });
}
