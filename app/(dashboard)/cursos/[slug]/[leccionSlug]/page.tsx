import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import {
  obtenerLeccionCompleta,
  obtenerEstructuraCurso,
  obtenerLeccionesAdyacentes,
} from "@/lib/lecciones/queries";
import { LeccionLayout } from "@/components/leccion/LeccionLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; leccionSlug: string }>;
}) {
  const { leccionSlug } = await params;
  return {
    title: leccionSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ slug: string; leccionSlug: string }>;
}) {
  const { slug, leccionSlug } = await params;
  const user = await requireAuth();

  const [leccion, estructura] = await Promise.all([
    obtenerLeccionCompleta(slug, leccionSlug, user.id),
    obtenerEstructuraCurso(slug, user.id),
  ]);

  if (!leccion) notFound();

  const nav = await obtenerLeccionesAdyacentes(
    slug,
    leccion.modulo.orden,
    leccion.orden
  );

  return (
    <LeccionLayout
      leccion={leccion}
      estructura={estructura}
      cursoSlug={slug}
      anterior={nav.anterior}
      siguiente={nav.siguiente}
    />
  );
}
