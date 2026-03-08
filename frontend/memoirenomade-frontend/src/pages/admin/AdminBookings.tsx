import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Eye, Mail } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { tourService } from "@/services/tourService";
import { Booking, BookingSummary } from "@/types/booking.types";
import { TourSummary } from "@/types/tour.types";
import { formatDate, formatPrice } from "@/utils/formatters";
import AdminBookingDetail from "./AdminBookingDetail";

const statusColors: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  Confirmada: "bg-green-100 text-green-700",
  Cancelada: "bg-red-100 text-red-700",
  Completada: "bg-blue-100 text-blue-700",
  Reembolsada: "bg-purple-100 text-purple-700",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTourId, setFilterTourId] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, toursData] = await Promise.all([
        bookingService.getAllBookings(),
        tourService.getAllTours(),
      ]);
      setBookings(bookingsData);
      setTours(toursData);
    } catch {
      setActionError("No se pudieron cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAllBookings({
        status: filterStatus || undefined,
        tourId: filterTourId ? parseInt(filterTourId) : undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
      });
      setBookings(data);
    } catch {
      setActionError("No se pudieron cargar las reservas.");
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const booking = await bookingService.getBookingById(id);
      setSelectedBooking(booking);
    } catch {
      setActionError("No se pudo cargar el detalle de la reserva.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (selectedBooking) {
    return (
      <AdminBookingDetail
        booking={selectedBooking}
        onBack={() => {
          setSelectedBooking(null);
          fetchBookings();
        }}
        onUpdate={async () => {
          const updated = await bookingService.getBookingById(
            selectedBooking.id,
          );
          setSelectedBooking(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            Gestión de Reservas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {bookings.length} reservas en total
          </p>
        </div>
      </div>

      {/* Error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Completada">Completada</option>
          <option value="Reembolsada">Reembolsada</option>
        </select>

        <select
          value={filterTourId}
          onChange={(e) => setFilterTourId(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
        >
          <option value="">Todos los tours</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
          placeholder="Desde"
        />

        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
          placeholder="Hasta"
        />

        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-semibold rounded-xl transition-all text-sm"
        >
          <RefreshCw size={14} />
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400">No hay reservas que mostrar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Tours
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Fecha reserva
                  </th>
                  <th className="text-right px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Importe
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Código */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-yellow-600">
                        {booking.confirmationCode}
                      </span>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-[#1a1a2e]">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.customerEmail}
                      </p>
                    </td>

                    {/* Tours */}
                    <td className="px-4 py-4">
                      {booking.tours?.map((tourName, i) => (
                        <p
                          key={i}
                          className="text-xs text-gray-600 line-clamp-1"
                        >
                          {tourName}
                        </p>
                      ))}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.bookingDate.split("T")[0])}
                      </p>
                    </td>

                    {/* Importe */}
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-[#1a1a2e]">
                        {formatPrice(booking.totalAmount)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          statusColors[booking.status] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(booking.id)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={`mailto:${booking.customerEmail}`}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                          title="Enviar email"
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
