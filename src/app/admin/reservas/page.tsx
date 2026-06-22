import {
  obtenerReservas,
  obtenerToursParaFiltro,
  parsearFiltrosReservas,
  construirQueryStringFiltros,
} from "@/lib/reservas/consultas";
import { FiltrosReservas } from "@/components/admin/filtros-reservas";
import { TablaReservas } from "@/components/admin/tabla-reservas";

interface PropiedadesPaginaReservas {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaReservas({
  searchParams,
}: PropiedadesPaginaReservas) {
  const parametros = await searchParams;
  const filtros = parsearFiltrosReservas(parametros);

  const [{ reservas, totalPaginas, paginaActual }, tours] = await Promise.all([
    obtenerReservas(filtros),
    obtenerToursParaFiltro(),
  ]);

  const enlaceExportar = `/api/admin/reservas/exportar?${construirQueryStringFiltros(
    filtros
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-marca-carbon">Reservas</h1>
          <p className="mt-1 text-sm text-marca-gris">
            Gestiona todas las reservas de Mémoire Nomade
          </p>
        </div>
        <a
          href={enlaceExportar}
          className="rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
        >
          Exportar CSV
        </a>
      </div>

      <FiltrosReservas tours={tours} />

      <TablaReservas
        reservas={reservas}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        filtros={filtros}
      />
    </div>
  );
}
