import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Calendar, Clock, Mail, Phone, AlertCircle } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking.types";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";
import { useCartStore } from "@/store/useCartStore";

export default function PaymentConfirmation() {
  const { confirmationCode } = useParams<{ confirmationCode: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { clearCart } = useCartStore();

  // Cargar reserva
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getByConfirmationCode(
          confirmationCode!,
        );
        setBooking(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [confirmationCode]);

  // Limpiar carrito al confirmar
  useEffect(() => {
    if (booking) {
      clearCart();
    }
  }, [booking, clearCart]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getByConfirmationCode(
          confirmationCode!,
        );
        setBooking(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [confirmationCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-3">
            Reserva no encontrada
          </h1>
          <p className="text-gray-500 mb-6">
            No pudimos encontrar la reserva con el código{" "}
            <strong>{confirmationCode}</strong>.
          </p>
          <Link
            to="/tours"
            className="inline-block bg-yellow-500 text-[#1a1a2e] font-bold px-8 py-3 rounded-full"
          >
            Ver tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-app max-w-3xl">
        {/* ── Cabecera de éxito ─────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a2e] mb-2">
            ¡Reserva confirmada!
          </h1>
          <p className="text-gray-500 text-lg">
            Gracias, <strong>{booking.customer.name}</strong>. Tu experiencia en
            París está reservada.
          </p>
        </div>

        {/* ── Código de confirmación ────────────────────────── */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 text-center mb-6">
          <p className="text-gray-400 text-sm mb-1">Código de confirmación</p>
          <p className="text-yellow-400 font-mono text-3xl font-bold tracking-widest">
            {booking.confirmationCode}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Guarda este código para consultar tu reserva en cualquier momento.
          </p>
        </div>

        {/* ── Detalle de tours reservados ───────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-serif font-bold text-[#1a1a2e] text-xl mb-5">
            Tours reservados
          </h2>

          <div className="space-y-5">
            {booking.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-4"
              >
                <h3 className="font-semibold text-[#1a1a2e] mb-3">
                  {item.tourName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-yellow-500 shrink-0" />
                    <span>{formatDate(item.sessionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-yellow-500 shrink-0" />
                    <span>{formatTime(item.sessionTime)}</span>
                  </div>
                </div>

                {item.includesSeineCruise && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-2">
                    Incluye crucero por el Sena
                  </span>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-gray-500">{item.pricingLabel}</span>
                  <span className="font-semibold text-yellow-600">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 mt-5 pt-4 flex justify-between items-center">
            <span className="font-bold text-[#1a1a2e] text-lg">
              Total pagado
            </span>
            <span className="font-bold text-yellow-600 text-2xl">
              {formatPrice(booking.totalAmount)}
            </span>
          </div>
        </div>

        {/* ── Datos del cliente ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-serif font-bold text-[#1a1a2e] text-xl mb-4">
            Tus datos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Nombre</p>
              <p className="text-gray-700 font-medium">
                {booking.customer.name}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Email</p>
              <p className="text-gray-700 font-medium">
                {booking.customer.email}
              </p>
            </div>
            {booking.customer.phone && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Teléfono</p>
                <p className="text-gray-700 font-medium">
                  {booking.customer.phone}
                </p>
              </div>
            )}
            {booking.customer.country && (
              <div>
                <p className="text-gray-400 text-xs mb-1">País</p>
                <p className="text-gray-700 font-medium">
                  {booking.customer.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Aviso punto de encuentro ──────────────────────── */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#1a1a2e] mb-1">
                Próximo paso
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nos pondremos en contacto contigo en{" "}
                <strong>{booking.customer.email}</strong> para indicarte el
                punto de encuentro y todos los detalles de tu tour. Por favor,
                revisa también tu carpeta de spam.
              </p>
            </div>
          </div>
        </div>

        {/* ── Política de cancelaciones ─────────────────────── */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-gray-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#1a1a2e] mb-2">
                Política de cancelaciones
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Más de 30 días antes: reembolso del 70%</li>
                <li>• Entre 15 y 30 días antes: reembolso del 50%</li>
                <li>• Menos de 15 días antes: sin reembolso</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Para cancelar, contacta con nosotros directamente por email o
                teléfono.
              </p>

              <div className="flex gap-4 mt-3">
                <a
                  href="mailto:info@memoirenomade.com"
                  className="flex items-center gap-1 text-xs text-yellow-600 hover:underline"
                >
                  <Mail size={12} />
                  info@memoirenomade.com
                </a>

                <a
                  href="tel:+33600000000"
                  className="flex items-center gap-1 text-xs text-yellow-600 hover:underline"
                >
                  <Phone size={12} />
                  +33 6 00 00 00 00
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Botones finales ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/tours"
            className="text-center border-2 border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-semibold px-8 py-3 rounded-full transition-all"
          >
            Ver más tours
          </Link>
          <Link
            to="/"
            className="text-center bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold px-8 py-3 rounded-full transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
