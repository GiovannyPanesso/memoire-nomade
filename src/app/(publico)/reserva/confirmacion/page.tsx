import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { obtenerConfirmacionReservaPorPaymentIntent } from "@/lib/reservas/consultas";
import { ContenidoConfirmacion } from "@/components/reservas/contenido-confirmacion";
import { EsperaConfirmacionReserva } from "@/components/reservas/espera-confirmacion";

export const metadata: Metadata = {
  title: "Reserva confirmada | Mémoire Nomade",
};

const ESTADOS_REDIRECCION_EXITOSOS = new Set(["succeeded", "processing"]);

interface PropiedadesPaginaConfirmacion {
  searchParams: Promise<{
    payment_intent?: string;
    redirect_status?: string;
    tour?: string;
  }>;
}

export default async function PaginaConfirmacionReserva({
  searchParams,
}: PropiedadesPaginaConfirmacion) {
  const parametros = await searchParams;

  // Solo se produce cuando Stripe redirige de vuelta tras un paso adicional
  // (p. ej. 3D Secure) que terminó en fallo o cancelación.
  if (
    parametros.redirect_status &&
    !ESTADOS_REDIRECCION_EXITOSOS.has(parametros.redirect_status)
  ) {
    redirect(
      `/reserva/cancelada${parametros.tour ? `?tour=${parametros.tour}` : ""}`
    );
  }

  const paymentIntentId = parametros.payment_intent;

  if (!paymentIntentId) {
    redirect("/tours");
  }

  const confirmacion = await obtenerConfirmacionReservaPorPaymentIntent(paymentIntentId);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6 pb-16 pt-24">
      {confirmacion ? (
        <ContenidoConfirmacion
          numero={confirmacion.numero}
          tourNombre={confirmacion.tourNombre}
          fecha={confirmacion.fecha}
          paymentIntentId={paymentIntentId}
        />
      ) : (
        <EsperaConfirmacionReserva paymentIntentId={paymentIntentId} />
      )}
    </div>
  );
}
