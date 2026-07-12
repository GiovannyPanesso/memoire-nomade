import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const globalConMailer = globalThis as unknown as { mailer?: Transporter };

function crearTransporter(): Transporter {
  const usuario = process.env.GMAIL_USER;
  const contrasena = process.env.GMAIL_APP_PASSWORD;

  if (!usuario || !contrasena) {
    throw new Error("Faltan las variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: usuario,
      pass: contrasena,
    },
  });
}

export const mailer = globalConMailer.mailer ?? crearTransporter();

if (process.env.NODE_ENV !== "production") {
  globalConMailer.mailer = mailer;
}
