import Stripe from "stripe";

const globalParaStripe = globalThis as unknown as { stripe?: Stripe };

function obtenerClaveSecreta(): string {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) {
    throw new Error("Falta la variable de entorno STRIPE_SECRET_KEY.");
  }
  return clave;
}

export const stripe = globalParaStripe.stripe ?? new Stripe(obtenerClaveSecreta());

if (process.env.NODE_ENV !== "production") {
  globalParaStripe.stripe = stripe;
}
