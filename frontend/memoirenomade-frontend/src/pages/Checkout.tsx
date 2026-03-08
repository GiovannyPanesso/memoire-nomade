import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/useCartStore";
import { bookingService } from "@/services/bookingService";
import { stripeService } from "@/services/stripeService";
import ProgressBar from "@/components/ProgressBar";
import OrderSummary from "@/components/OrderSummary";
import StripePaymentForm from "@/components/StripePaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const customerSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  email: z.string().email("El email no es válido."),
  phone: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalAmount } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      navigate("/cart");
    }
  }, [items.length, isProcessing, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const onCustomerSubmit = async (data: CustomerForm) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Crear reserva en el backend
      const booking = await bookingService.createBooking({
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          country: data.country || null,
        },
        items: items.map((item) => ({
          sessionId: item.sessionId,
          sessionPricingId: item.sessionPricingId,
          numberOfChildren: item.numChildren,
        })),
        paymentMethod: "Stripe",
        notes: data.notes || null,
      });

      // Crear PaymentIntent en Stripe
      const { clientSecret: secret } = await stripeService.createPaymentIntent(
        booking.confirmationCode,
      );

      setConfirmationCode(booking.confirmationCode);
      setClientSecret(secret);
      setStep(2);
    } catch {
      setPaymentError("No se pudo procesar la reserva. Inténtalo de nuevo.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/confirmation/${confirmationCode}`);
  };

  const handlePaymentError = (message: string) => {
    setPaymentError(message);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-app max-w-5xl">
        <ProgressBar currentStep={step === 1 ? 2 : 3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* ── Formulario principal ──────────────────────── */}
          <div className="lg:col-span-2">
            {/* Paso 1: Datos del cliente */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-6">
                  Tus datos
                </h2>

                <form
                  onSubmit={handleSubmit(onCustomerSubmit)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        {...register("name")}
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                          errors.name
                            ? "border-red-300"
                            : "border-gray-200 focus:border-yellow-400"
                        }`}
                        placeholder="Tu nombre completo"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                          errors.email
                            ? "border-red-300"
                            : "border-gray-200 focus:border-yellow-400"
                        }`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono{" "}
                        <span className="text-gray-400">(opcional)</span>
                      </label>
                      <input
                        {...register("phone")}
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors"
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    {/* País */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País <span className="text-gray-400">(opcional)</span>
                      </label>
                      <input
                        {...register("country")}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors"
                        placeholder="España"
                      />
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas <span className="text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        {...register("notes")}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors resize-none"
                        placeholder="Alergias, necesidades especiales, preguntas..."
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <p className="text-red-600 text-sm">{paymentError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1a1a2e] border-t-transparent" />
                    ) : null}
                    Continuar al pago
                  </button>
                </form>
              </div>
            )}

            {/* Paso 2: Pago con Stripe */}
            {step === 2 && clientSecret && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-2">
                  Pago seguro
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Reserva{" "}
                  <span className="font-mono font-bold text-yellow-600">
                    {confirmationCode}
                  </span>
                </p>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                    <p className="text-red-600 text-sm">{paymentError}</p>
                  </div>
                )}

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#c9a84c",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    amount={totalAmount()}
                    confirmationCode={confirmationCode!}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>

                <button
                  onClick={() => {
                    setStep(1);
                    setClientSecret(null);
                  }}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
                >
                  ← Volver a mis datos
                </button>
              </div>
            )}
          </div>

          {/* ── Resumen del pedido ────────────────────────── */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
