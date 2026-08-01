import { render } from "@react-email/render";
import { mailer } from "@/lib/mailer";
import { ConfirmacionCliente } from "@/lib/emails/plantillas/confirmacion-cliente";
import { NotificacionAdmin } from "@/lib/emails/plantillas/notificacion-admin";
import { AlertaBloqueoLogin } from "@/lib/emails/plantillas/alerta-bloqueo-login";
import { generarPdfReserva, nombreArchivoPdfReserva } from "@/lib/pdf/generar-pdf-reserva";
import { logger } from "@/lib/logger";
import type { DatosEmailReserva } from "@/types";

function obtenerRemitente(): string {
  const usuario = process.env.GMAIL_USER;
  if (!usuario) {
    throw new Error("Falta la variable de entorno GMAIL_USER.");
  }
  return `"Mémoire Nomade" <${usuario}>`;
}

function obtenerUrlApp(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function obtenerEmailsAdmin(): string[] {
  return [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(
    (email): email is string => Boolean(email)
  );
}

export async function enviarEmailConfirmacion(datos: DatosEmailReserva): Promise<void> {
  try {
    const [html, pdfReserva] = await Promise.all([
      render(ConfirmacionCliente({ datos })),
      generarPdfReserva(datos),
    ]);

    await mailer.sendMail({
      from: obtenerRemitente(),
      to: datos.emailCliente,
      subject: `Reserva confirmada — ${datos.numero}`,
      html,
      attachments: [
        {
          filename: nombreArchivoPdfReserva(datos.numero),
          content: pdfReserva,
        },
      ],
    });
  } catch (error) {
    logger.error("No se pudo enviar el email de confirmación al cliente", {
      error,
      numero: datos.numero,
    });
  }
}

export async function enviarEmailAdmin(datos: DatosEmailReserva): Promise<void> {
  const emailsAdmin = obtenerEmailsAdmin();

  if (emailsAdmin.length === 0) {
    logger.error("No hay email de administrador configurado para notificaciones", {
      numero: datos.numero,
    });
    return;
  }

  try {
    const html = await render(
      NotificacionAdmin({
        datos,
        urlReserva: `${obtenerUrlApp()}/admin/reservas/${datos.reservaId}`,
      })
    );

    await mailer.sendMail({
      from: obtenerRemitente(),
      to: emailsAdmin,
      subject: `Nueva reserva — ${datos.numero}`,
      html,
    });
  } catch (error) {
    logger.error("No se pudo enviar el email de notificación al admin", {
      error,
      numero: datos.numero,
    });
  }
}

interface DatosAlertaBloqueoLogin {
  emailIntentado: string;
  ip: string;
  bloqueadoHasta: Date;
}

export async function enviarEmailAlertaBloqueoLogin(
  datos: DatosAlertaBloqueoLogin
): Promise<void> {
  const emailsAdmin = obtenerEmailsAdmin();

  if (emailsAdmin.length === 0) {
    logger.error("No hay email de administrador configurado para alertas de bloqueo", {
      emailIntentado: datos.emailIntentado,
    });
    return;
  }

  try {
    const html = await render(AlertaBloqueoLogin(datos));

    await mailer.sendMail({
      from: obtenerRemitente(),
      to: emailsAdmin,
      subject: "Alerta: acceso al panel de admin bloqueado por intentos fallidos",
      html,
    });
  } catch (error) {
    logger.error("No se pudo enviar el email de alerta de bloqueo de login", {
      error,
      emailIntentado: datos.emailIntentado,
    });
  }
}
