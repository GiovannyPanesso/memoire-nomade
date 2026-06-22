import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";
import {
  obtenerResumenDashboard,
  obtenerReservasRecientes,
} from "@/lib/reservas/dashboard";
import { TarjetaResumen } from "@/components/admin/tarjeta-resumen";
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

export default async function PaginaDashboardAdmin() {
  const sesion = await getServerSession(opcionesAuth);
  const [resumen, reservasRecientes] = await Promise.all([
    obtenerResumenDashboard(),
    obtenerReservasRecientes(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-marca-carbon">
          Bienvenido, {sesion?.user?.name}
        </h1>
        <p className="mt-1 text-sm text-marca-gris">
          Resumen general de la actividad de Mémoire Nomade
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaResumen
          titulo="Reservas de hoy"
          valor={String(resumen.reservasHoy)}
        />
        <TarjetaResumen
          titulo="Reservas de la semana"
          valor={String(resumen.reservasSemana)}
        />
        <TarjetaResumen
          titulo="Ingresos del mes"
          valor={formatoMoneda.format(resumen.ingresosMes)}
        />
        <TarjetaResumen
          titulo="Total de reservas"
          valor={String(resumen.totalReservas)}
        />
      </div>

      <div className="rounded-lg border border-marca-dorado/20 bg-white">
        <div className="border-b border-marca-dorado/20 px-6 py-4">
          <h2 className="font-serif text-lg text-marca-carbon">
            Reservas recientes
          </h2>
        </div>

        {reservasRecientes.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-marca-gris">
            Todavía no hay reservas registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-marca-dorado/20 text-marca-gris">
                  <th className="px-6 py-3 font-medium">Número</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Tour</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservasRecientes.map((reserva) => (
                  <tr
                    key={reserva.id}
                    className="border-b border-marca-dorado/10 last:border-0"
                  >
                    <td className="px-6 py-3 font-medium text-marca-carbon">
                      {reserva.numero}
                    </td>
                    <td className="px-6 py-3 text-marca-carbon">
                      {reserva.nombreCliente}
                    </td>
                    <td className="px-6 py-3 text-marca-carbon">
                      {reserva.tourNombre}
                    </td>
                    <td className="px-6 py-3 text-marca-gris">
                      {formatoFecha.format(reserva.fecha)}
                    </td>
                    <td className="px-6 py-3 text-marca-carbon">
                      {formatoMoneda.format(reserva.precioTotal)}
                    </td>
                    <td className="px-6 py-3">
                      <BadgeEstado estado={reserva.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
