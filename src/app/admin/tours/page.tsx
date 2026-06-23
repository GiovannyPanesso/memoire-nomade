import Link from "next/link";
import { obtenerTours } from "@/lib/tours/consultas";
import { alternarActivoTour } from "@/lib/tours/acciones";
import { BotonEliminarTour } from "@/components/admin/boton-eliminar-tour";

export default async function PaginaTours() {
  const tours = await obtenerTours();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-marca-carbon">Tours</h1>
          <p className="mt-1 text-sm text-marca-gris">
            Gestiona el catálogo de tours de Mémoire Nomade
          </p>
        </div>
        <Link
          href="/admin/tours/nuevo"
          className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
        >
          Nuevo tour
        </Link>
      </div>

      {tours.length === 0 ? (
        <div className="rounded-lg border border-marca-dorado/20 bg-white p-8 text-center text-sm text-marca-gris">
          Todavía no hay tours registrados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-marca-dorado/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-marca-dorado/20 text-marca-gris">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Duración</th>
                <th className="px-4 py-3 font-medium">Tarifas</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr
                  key={tour.id}
                  className="border-b border-marca-dorado/10 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-marca-carbon">
                    <Link
                      href={`/admin/tours/${tour.id}`}
                      className="hover:text-marca-dorado-oscuro hover:underline"
                    >
                      {tour.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-marca-gris">{tour.slug}</td>
                  <td className="px-4 py-3 text-marca-carbon">
                    {tour.duracion}
                  </td>
                  <td className="px-4 py-3 text-marca-carbon">
                    {tour.numeroTarifas}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        tour.activo
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-marca-gris/20 text-marca-gris"
                      }`}
                    >
                      {tour.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <form
                        action={alternarActivoTour.bind(
                          null,
                          tour.id,
                          !tour.activo
                        )}
                      >
                        <button
                          type="submit"
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                            tour.activo
                              ? "border-marca-gris/30 text-marca-gris hover:bg-marca-gris/10"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {tour.activo ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="rounded-md border border-marca-dorado px-3 py-1.5 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
                      >
                        Editar
                      </Link>
                      <BotonEliminarTour id={tour.id} nombre={tour.nombre} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
