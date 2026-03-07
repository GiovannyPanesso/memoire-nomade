import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, ChevronLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";

export default function Cart() {
  const { items, removeItem, totalAmount } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingCart size={64} className="text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-500 mb-8">
            Explora nuestros tours y añade experiencias únicas en París.
          </p>
          <Link
            to="/tours"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold px-8 py-3 rounded-full transition-all"
          >
            Ver tours disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] py-12">
        <div className="container-app">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Seguir explorando
          </button>
          <h1 className="text-white font-serif text-3xl md:text-4xl font-bold">
            Tu carrito
          </h1>
          <p className="text-gray-400 mt-2">
            {items.length} {items.length === 1 ? "experiencia" : "experiencias"}{" "}
            seleccionadas
          </p>
        </div>
      </div>

      <div className="container-app py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Lista de ítems ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.sessionId}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex gap-4 p-5">
                  {/* Imagen */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={
                        item.tourImageUrl ||
                        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200"
                      }
                      alt={item.tourName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-serif font-bold text-[#1a1a2e] text-lg leading-tight">
                        {item.tourName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.sessionId)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        aria-label="Eliminar ítem"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      📅 {formatDate(item.sessionDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      🕐 {formatTime(item.sessionTime)}
                    </p>

                    {item.includesSeineCruise && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1">
                        Incluye crucero por el Sena
                      </span>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {item.pricingLabel} — {formatPrice(item.pricingPrice)}
                      </span>
                      {item.numChildren > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {item.numChildren} niño
                          {item.numChildren > 1 ? "s" : ""} —{" "}
                          {formatPrice(
                            item.childPricePerChild * item.numChildren,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtotal del ítem */}
                <div className="border-t border-gray-100 px-5 py-3 flex justify-between items-center bg-gray-50">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-bold text-yellow-600 text-lg">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Resumen del pedido ────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-serif font-bold text-[#1a1a2e] text-xl mb-6">
                Resumen del pedido
              </h2>

              {/* Desglose */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div
                    key={item.sessionId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-500 truncate pr-2">
                      {item.tourName}
                    </span>
                    <span className="text-gray-700 font-medium shrink-0">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1a1a2e] text-lg">
                    Total
                  </span>
                  <span className="font-bold text-yellow-600 text-2xl">
                    {formatPrice(totalAmount())}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  IVA incluido · Moneda EUR
                </p>
              </div>

              {/* Botón proceder */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                Proceder al pago
                <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                🔒 Pago 100% seguro con Stripe o PayPal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
