import { requireAuth } from "@/lib/auth";
import {
  listarCategorias,
  obtenerCompanerosDelArea,
  obtenerReconocimientosDelEquipo,
  obtenerReconocimientosRecibidos,
  obtenerReconocimientosDados,
} from "@/lib/reconocimientos/queries";
import { ReconocimientosCliente } from "@/components/reconocimientos/ReconocimientosCliente";

export const metadata = { title: "Reconocimientos" };

export default async function ReconocimientosPage() {
  const user = await requireAuth();

  if (!user.areaId) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Necesitas estar asignado a un area para ver los reconocimientos
          del equipo.
        </p>
      </div>
    );
  }

  const [feed, recibidos, dados, companeros, categorias] = await Promise.all([
    obtenerReconocimientosDelEquipo({
      areaId: user.areaId,
      currentUserId: user.id,
      limite: 30,
    }),
    obtenerReconocimientosRecibidos(user.id),
    obtenerReconocimientosDados(user.id),
    obtenerCompanerosDelArea({ areaId: user.areaId, excluirUserId: user.id }),
    listarCategorias(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <ReconocimientosCliente
        feed={feed.reconocimientos}
        recibidos={recibidos}
        dados={dados}
        companeros={companeros}
        categorias={categorias}
      />
    </div>
  );
}
