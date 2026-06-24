import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

let promesaStripe: Promise<Stripe | null> | undefined;

export function obtenerPromesaStripe(): Promise<Stripe | null> {
  if (!promesaStripe) {
    const clave = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!clave) {
      throw new Error("Falta la variable de entorno NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");
    }
    promesaStripe = loadStripe(clave);
  }
  return promesaStripe;
}
