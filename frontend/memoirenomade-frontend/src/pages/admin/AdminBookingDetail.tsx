import { useState } from "react";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Booking } from "@/types/booking.types";
import { bookingService } from "@/services/bookingService";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";
import api from "@/services/api";

interface AdminBookingDetailProps {
  booking: Booking;
  onBack: () => void;
  onUpdate: () => Promise<void>;
}

const statusColors: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  Confirmada: "bg-green-100 text-green-700",
  Cancelada: "bg-red-100 text-red-700",
  Completada: "bg-blue-100 text-blue-700",
  Reembolsada: "bg-purple-100 text-purple-700",
};

// Sugerencias de reembolso según políticas
const getRefundSuggestion = (bookingDate: string) => {
  const days = Math.floor(
    (new Date().getTime() - new Date(bookingDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (days < 15)
    return { percentage: 0, label: "Sin reembolso (menos de 15 días)" };
  if (days < 30) return { percentage: 50, label: "Reembolso sugerido: 50%" };
  return { percentage: 70, label: "Reembolso sugerido: 70%" };
};

export default function AdminBookingDetail({
  booking,
  onBack,
  onUpdate,
}: AdminBookingDetailProps) {
  const [newStatus, setNewStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado reembolso
  const suggestion = getRefundSuggestion(booking.bookingDate);
  const [refundPercentage, setRefundPercentage] = useState(
    suggestion.percentage,
  );
  const refundAmount = (booking.totalAmount * refundPercentage) / 100;
  const [refunding, setRefunding] = useState(false);

  const handleRefund = async () => {
    if (
      !confirm(
        `¿Confirmas el reembolso de ${formatPrice(refundAmount)}? Esta acción no se puede deshacer.`,
      )
    )
      return;

    setRefunding(true);
    setActionError(null);

    try {
      await api.post(`/admin/bookings/${booking.id}/refund`, {
        amount: refundAmount,
      });
      setSuccessMsg(
        `Reembolso de ${formatPrice(refundAmount)} procesado correctamente.`,
      );
      await onUpdate();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo procesar el reembolso.",
      );
    } finally {
      setRefunding(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);
    setSuccessMsg(null);

    try {
      await bookingService.updateBooking(booking.id, {
        status: newStatus !== booking.status ? newStatus : undefined,
        notes: notes !== booking.notes ? notes : undefined,
      });
      await onUpdate();
      setSuccessMsg("Reserva actualizada correctamente.");
    } catch {
      setActionError("No se pudo actualizar la reserva.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1a2e]">
              Reserva{" "}
              <span className="font-mono text-yellow-600">
                {booking.confirmationCode}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Realizada el {formatDate(booking.bookingDate.split("T")[0])}
            </p>
          </div>
        </div>
        <span
          className={`sm:ml-auto text-sm font-semibold px-4 py-1.5 rounded-full self-start sm:self-auto ${
            statusColors[booking.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Mensajes */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-600 text-sm">{actionError}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-600 text-sm">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Datos del cliente ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif font-bold text-[#1a1a2e] text-lg mb-4">
            Datos del cliente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-yellow-600 font-bold text-sm">
                  {booking.customer.name[0].toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-[#1a1a2e]">
                {booking.customer.name}
              </p>
            </div>
            <a
              href={`mailto:${booking.customer.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <Mail size={15} className="text-gray-400" />
              {booking.customer.email}
            </a>
            {booking.customer.phone && (
              <a
                href={`tel:${booking.customer.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <Phone size={15} className="text-gray-400" />
                {booking.customer.phone}
              </a>
            )}
            {booking.customer.country && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={15} className="text-gray-400" />
                {booking.customer.country}
              </div>
            )}
          </div>

          <a
            href={`mailto:${booking.customer.email}?subject=Tu reserva ${booking.confirmationCode} - Mémoire Nomade`}
            className="mt-4 flex items-center justify-center gap-2 w-full border-2 border-yellow-400 text-yellow-600 font-semibold py-2.5 rounded-xl hover:bg-yellow-50 transition-all text-sm"
          >
            <Mail size={16} />
            Contactar al cliente
          </a>
        </div>

        {/* ── Estado y notas ────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-serif font-bold text-[#1a1a2e] text-lg mb-4">
            Estado y notas
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de la reserva
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Completada">Completada</option>
              <option value="Reembolsada">Reembolsada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas internas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notas visibles solo para el equipo..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none resize-none text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1a1a2e] border-t-transparent" />
            ) : (
              <RefreshCw size={16} />
            )}
            Guardar cambios
          </button>
        </div>
      </div>

      {/* ── Tours reservados ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-serif font-bold text-[#1a1a2e] text-lg mb-5">
          Tours reservados
        </h2>
        <div className="space-y-4">
          {booking.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 rounded-xl p-4"
            >
              <h3 className="font-semibold text-[#1a1a2e] mb-3">
                {item.tourName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="text-yellow-500" />
                  {formatDate(item.sessionDate)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={14} className="text-yellow-500" />
                  {formatTime(item.sessionTime)}
                </div>
              </div>
              {item.includesSeineCruise && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full inline-block mt-2">
                  Crucero por el Sena incluido
                </span>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">{item.pricingLabel}</span>
                <span className="font-bold text-yellow-600">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-gray-200 mt-4 pt-4 flex justify-between">
          <span className="font-bold text-[#1a1a2e]">Total</span>
          <span className="font-bold text-yellow-600 text-xl">
            {formatPrice(booking.totalAmount)}
          </span>
        </div>
      </div>

      {/* ── Reembolso ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-serif font-bold text-[#1a1a2e] text-lg mb-2">
          Gestión de reembolso
        </h2>
        <p className="text-sm text-gray-500 mb-5">{suggestion.label}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porcentaje de reembolso: <strong>{refundPercentage}%</strong>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={refundPercentage}
              onChange={(e) => setRefundPercentage(parseInt(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Importe a reembolsar
            </span>
            <span className="text-2xl font-bold text-yellow-600">
              {formatPrice(refundAmount)}
            </span>
          </div>

          <button
            disabled={refundPercentage === 0 || refunding}
            onClick={handleRefund}
            className="w-full border-2 border-red-300 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {refunding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
            ) : null}
            Emitir reembolso de {formatPrice(refundAmount)}
          </button>
        </div>
      </div>

      {/* ── Historial de estados ──────────────────────────────── */}
      {booking.statusHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif font-bold text-[#1a1a2e] text-lg mb-5">
            Historial de estados
          </h2>
          <div className="space-y-3">
            {booking.statusHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-[#1a1a2e]">
                    {h.previousStatus ? (
                      <>
                        <span className="text-gray-400">
                          {h.previousStatus}
                        </span>{" "}
                        → <strong>{h.newStatus}</strong>
                      </>
                    ) : (
                      <>
                        <strong>Creada</strong> como {h.newStatus}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(h.changedAt.split("T")[0])} · {h.changedBy}
                  </p>
                  {h.notes && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">
                      {h.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
