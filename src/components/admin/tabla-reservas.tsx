import Link from "next/link";
import { construirQueryStringFiltros } from "@/lib/reservas/consultas";
import type { FiltrosReservas, ReservaListado } from "@/types";
import { BadgeEstado } from "@/components/admin/badge-estado";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatoFechaHora = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface PropiedadesTablaReservas {
  reservas: ReservaListado[];
  paginaActual: number;
  totalPaginas: number;
  filtros: FiltrosReservas;
}

export function TablaReservas({
  reservas,
  paginaActual,
  totalPaginas,
  filtros,
}: PropiedadesTablaReservas) {
  const queryBase = construirQueryStringFiltros(filtros);

  function construirEnlacePagina(pagina: number): string {
    const parametros = new URLSearchParams(queryBase);
    parametros.set("pagina", String(pagina));
    return `/admin/reservas?${parametros.toString()}`;
  }

  if (reservas.length === 0) {
    return (
      <div className="rounded-lg border border-marca-dorado/20 bg-white p-8 text-center text-sm text-marca-gris">
        No se encontraron reservas con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-marca-dorado/20 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-marca-dorado/20 text-marca-gris">
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tour</th>
              <th className="px-4 py-3 font-medium">Fecha del tour</th>
              <th className="px-4 py-3 font-medium">Personas</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr
                key={reserva.id}
                className="border-b border-marca-dorado/10 last:border-0 hover:bg-marca-crema/50"
              >
                <td className="px-4 py-3 font-medium text-marca-carbon">
                  <Link
                    href={`/admin/reservas/${reserva.id}`}
                    className="hover:text-marca-dorado-oscuro hover:underline"
                  >
                    {reserva.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 text-marca-carbon">
                  {reserva.nombreCliente}
                </td>
                <td className="px-4 py-3 text-marca-gris">
                  {reserva.emailCliente}
                </td>
                <td className="px-4 py-3 text-marca-carbon">
                  {reserva.tourNombre}
                </td>
                <td className="px-4 py-3 text-marca-gris">
                  {formatoFecha.format(reserva.fecha)}
                </td>
                <td className="px-4 py-3 text-marca-carbon">
                  {reserva.numeroPersonas}
                </td>
                <td className="px-4 py-3 text-marca-carbon">
                  {formatoMoneda.format(reserva.precioTotal)}
                </td>
                <td className="px-4 py-3">
                  <BadgeEstado estado={reserva.estado} />
                </td>
                <td className="px-4 py-3 text-marca-gris">
                  {formatoFechaHora.format(reserva.creadoEn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 ? (
        <div className="flex items-center justify-between border-t border-marca-dorado/20 px-4 py-3 text-sm text-marca-gris">
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <Link
              href={construirEnlacePagina(Math.max(1, paginaActual - 1))}
              aria-disabled={paginaActual === 1}
              className={`rounded-md border border-marca-dorado/30 px-3 py-1.5 ${
                paginaActual === 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-marca-dorado/10"
              }`}
            >
              Anterior
            </Link>
            <Link
              href={construirEnlacePagina(
                Math.min(totalPaginas, paginaActual + 1)
              )}
              aria-disabled={paginaActual === totalPaginas}
              className={`rounded-md border border-marca-dorado/30 px-3 py-1.5 ${
                paginaActual === totalPaginas
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-marca-dorado/10"
              }`}
            >
              Siguiente
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
