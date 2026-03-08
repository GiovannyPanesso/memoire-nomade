import { useCartStore } from "@/store/useCartStore";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";

export default function OrderSummary() {
  const { items, totalAmount } = useCartStore();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
      <h3 className="font-serif font-bold text-[#1a1a2e] text-lg mb-5">
        Resumen del pedido
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.sessionId}
            className="border-b border-gray-100 pb-4 last:border-0"
          >
            <p className="font-semibold text-[#1a1a2e] text-sm leading-tight mb-1">
              {item.tourName}
            </p>
            <p className="text-xs text-gray-500">
              📅 {formatDate(item.sessionDate)}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              🕐 {formatTime(item.sessionTime)}
            </p>

            {item.includesSeineCruise && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block mb-2">
                Crucero por el Sena incluido
              </span>
            )}

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{item.pricingLabel}</span>
              <span>{formatPrice(item.pricingPrice)}</span>
            </div>

            {item.numChildren > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {item.numChildren} niño{item.numChildren > 1 ? "s" : ""}
                </span>
                <span>
                  {formatPrice(item.childPricePerChild * item.numChildren)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold text-[#1a1a2e] mt-2">
              <span>Subtotal</span>
              <span className="text-yellow-600">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#1a1a2e] text-lg">Total</span>
          <span className="font-bold text-yellow-600 text-2xl">
            {formatPrice(totalAmount())}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">IVA incluido · Moneda EUR</p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        🔒 Pago seguro con Stripe o PayPal
      </p>
    </div>
  );
}
