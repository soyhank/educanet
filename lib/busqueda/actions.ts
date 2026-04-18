"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ResultadoBusqueda = {
  cursos: { slug: string; titulo: string; nivel: string }[];
  personas: { nombre: string; apellido: string; puesto: string | null }[];
};

export async function buscarGlobal(query: string): Promise<ResultadoBusqueda> {
  await requireAuth();

  if (!query || query.length < 2) return { cursos: [], personas: [] };

  const [cursos, personas] = await Promise.all([
    prisma.curso.findMany({
      where: {
        publicado: true,
        OR: [
          { titulo: { contains: query, mode: "insensitive" } },
          { descripcion: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { slug: true, titulo: true, nivel: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        activo: true,
        OR: [
          { nombre: { contains: query, mode: "insensitive" } },
          { apellido: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { nombre: true, apellido: true, puesto: { select: { nombre: true } } },
      take: 5,
    }),
  ]);

  return {
    cursos: cursos.map((c) => ({ slug: c.slug, titulo: c.titulo, nivel: c.nivel })),
    personas: personas.map((p) => ({
      nombre: p.nombre,
      apellido: p.apellido,
      puesto: p.puesto?.nombre ?? null,
    })),
  };
}
