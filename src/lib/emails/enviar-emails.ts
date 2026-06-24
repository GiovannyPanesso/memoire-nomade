import { resend } from "@/lib/emails/resend";
import { ConfirmacionCliente } from "@/lib/emails/plantillas/confirmacion-cliente";
import { NotificacionAdmin } from "@/lib/emails/plantillas/notificacion-admin";
import { generarPdfReserva, nombreArchivoPdfReserva } from "@/lib/pdf/generar-pdf-reserva";
import { logger } from "@/lib/logger";
import type { DatosEmailReserva } from "@/types";

function obtenerEmailRemitente(): string {
  const email = process.env.RESEND_FROM_EMAIL;
  if (!email) {
    throw new Error("Falta la variable de entorno RESEND_FROM_EMAIL.");
  }
  return email;
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
    const pdfReserva = await generarPdfReserva(datos);

    await resend.emails.send({
      from: obtenerEmailRemitente(),
      to: datos.emailCliente,
      subject: `Reserva confirmada — ${datos.numero}`,
      react: ConfirmacionCliente({ datos }),
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
    await resend.emails.send({
      from: obtenerEmailRemitente(),
      to: emailsAdmin,
      subject: `Nueva reserva — ${datos.numero}`,
      react: NotificacionAdmin({
        datos,
        urlReserva: `${obtenerUrlApp()}/admin/reservas/${datos.reservaId}`,
      }),
    });
  } catch (error) {
    logger.error("No se pudo enviar el email de notificación al admin", {
      error,
      numero: datos.numero,
    });
  }
}
