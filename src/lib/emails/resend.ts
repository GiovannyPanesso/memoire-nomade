import { Resend } from "resend";

const globalParaResend = globalThis as unknown as { resend?: Resend };

function obtenerClaveApi(): string {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) {
    throw new Error("Falta la variable de entorno RESEND_API_KEY.");
  }
  return clave;
}

export const resend = globalParaResend.resend ?? new Resend(obtenerClaveApi());

if (process.env.NODE_ENV !== "production") {
  globalParaResend.resend = resend;
}
