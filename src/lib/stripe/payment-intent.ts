import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/cliente";

export const CENTIMOS_POR_EURO = 100;
const MONEDA = "eur";

export interface MetadataPaymentIntentReserva {
  [clave: string]: string;
  tourId: string;
  tourSlug: string;
  fecha: string;
  numeroAdultos: string;
  edadesNinos: string;
  // CSV de pares "tarifaId:cantidad" para los opcionales seleccionados
  opcionalesCantidades: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  paisCliente: string;
  mensajeCliente: string;
}

interface ParametrosCrearPaymentIntent {
  precioTotal: number;
  metadata: MetadataPaymentIntentReserva;
}

export async function crearPaymentIntentReserva({
  precioTotal,
  metadata,
}: ParametrosCrearPaymentIntent): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: Math.round(precioTotal * CENTIMOS_POR_EURO),
    currency: MONEDA,
    payment_method_types: ["card"],
    receipt_email: metadata.emailCliente,
    metadata,
  });
}
