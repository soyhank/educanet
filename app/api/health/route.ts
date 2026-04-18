import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "error" },
      { status: 503 }
    );
  }
}
