import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatPrice } from "@/utils/formatters";

interface StripePaymentFormProps {
  amount: number;
  confirmationCode: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function StripePaymentForm({
  amount,
  confirmationCode,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation/${confirmationCode}`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Error al procesar el pago.");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      <div className="bg-yellow-50 rounded-xl p-4 flex justify-between items-center">
        <span className="text-gray-600 font-medium">Total a pagar</span>
        <span className="text-2xl font-bold text-yellow-600">
          {formatPrice(amount)}
        </span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1a1a2e] border-t-transparent" />
            Procesando pago...
          </>
        ) : (
          `Pagar ${formatPrice(amount)}`
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
        Pago seguro con Stripe. Tus datos están cifrados.
      </p>
    </form>
  );
}
