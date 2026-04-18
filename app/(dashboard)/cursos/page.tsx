import { requireAuth } from "@/lib/auth";
import { listarCursos, listarAreas } from "@/lib/cursos/queries";
import { CatalogoPagina } from "@/components/curso/CatalogoPagina";
import { CursoGrid } from "@/components/curso/CursoGrid";
import Link from "next/link";
import type { NivelCurso } from "@prisma/client";
import type { EstadoCurso } from "@/types/cursos";
import { cn } from "@/lib/utils";

export const metadata = { title: "Cursos" };

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const soloMios = params["mis-cursos"] === "true";
  const areaId = params.area;
  const nivel = params.nivel as NivelCurso | undefined;
  const estado = params.estado as EstadoCurso | undefined;
  const busqueda = params.busqueda;
  const orden = (params.orden ?? "recientes") as
    | "recientes"
    | "alfabetico"
    | "duracion";

  const [cursos, areas] = await Promise.all([
    listarCursos({
      userId: user.id,
      areaId,
      nivel,
      estado,
      busqueda,
      orden,
      soloMios,
    }),
    listarAreas(),
  ]);

  const totalCompletados = cursos.filter((c) => c.estado === "completado").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <nav className="mb-2 text-sm text-muted-foreground">
          <Link href="/cursos" className="hover:text-foreground">
            Inicio
          </Link>
          <span className="mx-1">/</span>
          <span>{soloMios ? "Mis cursos" : "Catalogo"}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {soloMios ? "Mis cursos" : "Catalogo de cursos"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {cursos.length} cursos{" "}
              {totalCompletados > 0 &&
                `· ${totalCompletados} completado${totalCompletados > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b">
          <Link
            href="/cursos"
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              !soloMios
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Todos los cursos
          </Link>
          <Link
            href="/cursos?mis-cursos=true"
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              soloMios
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Mis cursos
          </Link>
        </div>
      </div>

      {/* Catalog with filters */}
      <CatalogoPagina areas={areas}>
        <CursoGrid cursos={cursos} />
      </CatalogoPagina>
    </div>
  );
}
