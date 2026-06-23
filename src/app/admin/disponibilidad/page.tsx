import { obtenerToursParaFiltro } from "@/lib/reservas/consultas";
import { CalendarioAdmin } from "@/components/admin/calendario-admin";

export default async function PaginaDisponibilidad() {
  const tours = await obtenerToursParaFiltro();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-marca-carbon">Disponibilidad</h1>
        <p className="mt-1 text-sm text-marca-gris">
          Gestiona el calendario de fechas disponibles de cada tour
        </p>
      </div>

      {tours.length === 0 ? (
        <div className="rounded-lg border border-marca-dorado/20 bg-white p-8 text-center text-sm text-marca-gris">
          Todavía no hay tours registrados.
        </div>
      ) : (
        <CalendarioAdmin tours={tours} />
      )}
    </div>
  );
}
