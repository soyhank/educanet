import { requireAuth } from "@/lib/auth";
import { obtenerRutaActualUsuario, obtenerPuestosSuperiores } from "@/lib/carrera/queries";
import { calcularProgresoRuta } from "@/lib/carrera/calculos";
import { CarreraHeader } from "@/components/carrera/CarreraHeader";
import { CarreraProgresoPrincipal } from "@/components/carrera/CarreraProgresoPrincipal";
import { CarreraSiguientesPasos } from "@/components/carrera/CarreraSiguientesPasos";
import { CarreraCursosRequeridos } from "@/components/carrera/CarreraCursosRequeridos";
import { CarreraMetricasRequeridas } from "@/components/carrera/CarreraMetricasRequeridas";
import { CarreraCaminoCompleto } from "@/components/carrera/CarreraCaminoCompleto";
import { MiCarreraSinRuta } from "@/components/carrera/MiCarreraSinRuta";
import { MiCarreraSinPuesto } from "@/components/carrera/MiCarreraSinPuesto";

export const metadata = { title: "Mi carrera" };

export default async function MiCarreraPage() {
  const user = await requireAuth();

  if (!user.puestoId) {
    return <MiCarreraSinPuesto />;
  }

  const ruta = await obtenerRutaActualUsuario(user.id);

  if (!ruta) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <CarreraHeader
          puestoNombre={user.puesto?.nombre ?? ""}
          areaNombre={user.area?.nombre}
          fechaIngreso={user.fechaIngreso}
        />
        <MiCarreraSinRuta />
      </div>
    );
  }

  const progreso = calcularProgresoRuta(ruta);
  const puestos = await obtenerPuestosSuperiores(user.puestoId);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <CarreraHeader
        puestoNombre={user.puesto?.nombre ?? ""}
        areaNombre={user.area?.nombre}
        fechaIngreso={user.fechaIngreso}
        puestoDestinoNombre={ruta.puestoDestino.nombre}
      />

      <CarreraProgresoPrincipal
        progreso={progreso}
        puestoOrigen={ruta.puestoOrigen.nombre}
        puestoDestino={ruta.puestoDestino.nombre}
      />

      {progreso.siguientesPasos.length > 0 && (
        <CarreraSiguientesPasos pasos={progreso.siguientesPasos} />
      )}

      <CarreraCursosRequeridos cursos={ruta.cursos} />

      <CarreraMetricasRequeridas metricas={ruta.metricas} />

      {puestos.length > 2 && <CarreraCaminoCompleto puestos={puestos} />}
    </div>
  );
}
