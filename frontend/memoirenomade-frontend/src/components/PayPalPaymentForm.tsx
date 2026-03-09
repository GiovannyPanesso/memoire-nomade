import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { paypalService } from "@/services/paypalService";
import { formatPrice } from "@/utils/formatters";

interface PayPalPaymentFormProps {
  amount: number;
  confirmationCode: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function PayPalPaymentForm({
  amount,
  confirmationCode,
  onSuccess,
  onError,
}: PayPalPaymentFormProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
      }}
    >
      <div className="space-y-5">
        <div className="bg-yellow-50 rounded-xl p-4 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total a pagar</span>
          <span className="text-2xl font-bold text-yellow-600">
            {formatPrice(amount)}
          </span>
        </div>

        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
          }}
          createOrder={async () => {
            try {
              return await paypalService.createOrder(confirmationCode);
            } catch {
              onError("No se pudo iniciar el pago con PayPal.");
              return "";
            }
          }}
          onApprove={async (data) => {
            try {
              await paypalService.captureOrder(data.orderID, confirmationCode);
              onSuccess();
            } catch {
              onError("No se pudo completar el pago con PayPal.");
            }
          }}
          onError={() => {
            onError("Error en el proceso de pago con PayPal.");
          }}
          onCancel={() => {
            onError("Pago cancelado.");
          }}
        />

        <p className="text-center text-xs text-gray-400">
          Serás redirigido a PayPal para completar el pago de forma segura.
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
