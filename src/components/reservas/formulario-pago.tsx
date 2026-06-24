"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

interface PropiedadesFormularioPago {
  tourSlug: string;
  tourNombre: string;
  precioTotal: number;
  onVolver: () => void;
}

export function FormularioPago({
  tourSlug,
  tourNombre,
  precioTotal,
  onVolver,
}: PropiedadesFormularioPago) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarPago(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setEnviando(true);
    setError(null);

    const { error: errorConfirmacion, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reserva/confirmacion?tour=${tourSlug}`,
      },
      redirect: "if_required",
    });

    if (errorConfirmacion) {
      setError(errorConfirmacion.message ?? "No se pudo procesar el pago.");
      setEnviando(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      router.push(`/reserva/confirmacion?payment_intent=${paymentIntent.id}&tour=${tourSlug}`);
      return;
    }

    setError("El pago no se pudo confirmar. Intenta con otro método de pago.");
    setEnviando(false);
  }

  return (
    <form
      onSubmit={manejarPago}
      className="space-y-5 rounded-lg border border-marca-dorado/20 bg-white p-6"
    >
      <div className="flex items-center justify-between border-b border-marca-dorado/10 pb-4">
        <div>
          <h2 className="font-serif text-xl text-marca-carbon">Pago</h2>
          <p className="text-sm text-marca-gris">{tourNombre}</p>
        </div>
        <span className="font-serif text-2xl text-marca-dorado-oscuro">
          {formatoMoneda.format(precioTotal)}
        </span>
      </div>

      <PaymentElement />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={!stripe || !elements || enviando}
        className="w-full rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Procesando…" : `Pagar ${formatoMoneda.format(precioTotal)} — Reservar ahora`}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-marca-gris">
        <ShieldCheck className="h-4 w-4" />
        Pago seguro con cifrado SSL
      </p>

      <button
        type="button"
        onClick={onVolver}
        disabled={enviando}
        className="w-full text-center text-sm text-marca-gris transition hover:text-marca-carbon disabled:cursor-not-allowed disabled:opacity-60"
      >
        Volver
      </button>
    </form>
  );
}
