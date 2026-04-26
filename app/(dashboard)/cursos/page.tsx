import { requireAuth } from "@/lib/auth";
import { listarCursos, listarAreas } from "@/lib/cursos/queries";
import { filtrosCursosCache } from "@/lib/cursos/filtros-params";
import { CatalogoPagina } from "@/components/curso/CatalogoPagina";
import { CursoGrid } from "@/components/curso/CursoGrid";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Cursos" };

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const rawParams = await searchParams;
  const { area, nivel, estado, busqueda, orden } = filtrosCursosCache.parse(rawParams);
  const soloMios = rawParams["mis-cursos"] === "true";

  const [cursos, areas] = await Promise.all([
    listarCursos({
      userId: user.id,
      areaId: area || undefined,
      nivel: nivel ?? undefined,
      estado: estado ?? undefined,
      busqueda: busqueda || undefined,
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
