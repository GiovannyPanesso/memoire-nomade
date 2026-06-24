import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { EstadoReserva } from "@prisma/client";
import { stripe } from "@/lib/stripe/cliente";
import { CENTIMOS_POR_EURO } from "@/lib/stripe/payment-intent";
import { prisma } from "@/lib/prisma/cliente";
import { fechaIsoAFechaUTC } from "@/lib/disponibilidad/fechas";
import { generarNumeroReserva } from "@/lib/reservas/numero-reserva";
import {
  construirOpcionalesEmail,
  decodificarCantidadesOpcionales,
  serializarOpcionalesSeleccionados,
} from "@/lib/reservas/opcionales";
import { construirDatosEmailReserva } from "@/lib/reservas/datos-email";
import { obtenerConfiguracion } from "@/lib/configuracion/consultas";
import { enviarEmailAdmin, enviarEmailConfirmacion } from "@/lib/emails/enviar-emails";
import { logger } from "@/lib/logger";
import type { OpcionalSeleccionadoReserva } from "@/types";

function obtenerSecretoWebhook(): string {
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) {
    throw new Error("Falta la variable de entorno STRIPE_WEBHOOK_SECRET.");
  }
  return secreto;
}

function parsearListaCsv(valor: string | undefined): string[] {
  return valor ? valor.split(",").filter(Boolean) : [];
}

async function manejarPagoExitoso(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const yaExiste = await prisma.reserva.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    select: { id: true },
  });

  // El webhook puede reenviarse para el mismo evento: evitamos duplicar la reserva.
  if (yaExiste) {
    return;
  }

  const metadata = paymentIntent.metadata;
  const tourId = metadata.tourId;

  if (!tourId || !metadata.fecha) {
    logger.error("Webhook de Stripe sin metadata suficiente para crear la reserva", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { tarifas: true },
  });

  if (!tour) {
    logger.error("Tour no encontrado al procesar el webhook de Stripe", {
      tourId,
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  const edadesNinos = parsearListaCsv(metadata.edadesNinos).map(Number);
  const numeroAdultos = Number(metadata.numeroAdultos) || 1;

  const cantidadesOpcionales = decodificarCantidadesOpcionales(metadata.opcionalesCantidades);
  const opcionalesSeleccionados: OpcionalSeleccionadoReserva[] = Object.entries(
    cantidadesOpcionales
  ).map(([tarifaId, cantidad]) => ({ tarifaId, cantidad }));

  const tarifasOpcionalesTour = tour.tarifas
    .filter((tarifa) => tarifa.esOpcional)
    .map((tarifa) => ({
      id: tarifa.id,
      nombreOpcional: tarifa.nombreOpcional,
      precio: tarifa.precio.toNumber(),
    }));

  const opcionalesDetalle = construirOpcionalesEmail(
    tarifasOpcionalesTour,
    opcionalesSeleccionados
  );

  const reserva = await prisma.$transaction(async (tx) => {
    const numero = await generarNumeroReserva(tx);

    return tx.reserva.create({
      data: {
        numero,
        tourId: tour.id,
        fecha: fechaIsoAFechaUTC(metadata.fecha),
        nombreCliente: metadata.nombreCliente,
        emailCliente: metadata.emailCliente,
        telefonoCliente: metadata.telefonoCliente,
        paisCliente: metadata.paisCliente,
        numeroAdultos,
        numeroNinos: edadesNinos.length,
        edadesNinos,
        opcionalesSeleccionados: serializarOpcionalesSeleccionados(opcionalesSeleccionados),
        precioTotal: paymentIntent.amount / CENTIMOS_POR_EURO,
        estado: EstadoReserva.CONFIRMADA,
        stripePaymentIntentId: paymentIntent.id,
        mensajeCliente: metadata.mensajeCliente || null,
      },
    });
  });

  const configuracion = await obtenerConfiguracion();
  const datosEmail = construirDatosEmailReserva(
    reserva,
    tour,
    opcionalesDetalle,
    configuracion
  );

  await Promise.all([
    enviarEmailConfirmacion(datosEmail),
    enviarEmailAdmin(datosEmail),
  ]);
}

function manejarPagoFallido(paymentIntent: Stripe.PaymentIntent): void {
  logger.error("Pago fallido en Stripe", {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message,
  });
}

export async function POST(request: Request) {
  const cuerpo = await request.text();
  const firma = request.headers.get("stripe-signature");

  if (!firma) {
    return NextResponse.json({ error: "Falta la firma del webhook" }, { status: 400 });
  }

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(cuerpo, firma, obtenerSecretoWebhook());
  } catch (error) {
    logger.error("Firma de webhook de Stripe inválida", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    if (evento.type === "payment_intent.succeeded") {
      await manejarPagoExitoso(evento.data.object as Stripe.PaymentIntent);
    } else if (evento.type === "payment_intent.payment_failed") {
      manejarPagoFallido(evento.data.object as Stripe.PaymentIntent);
    }
  } catch (error) {
    logger.error("Error al procesar el evento del webhook de Stripe", {
      error,
      tipoEvento: evento.type,
    });
  }

  // Siempre respondemos 200 una vez verificada la firma: si devolviéramos un
  // error aquí, Stripe reintentaría indefinidamente el mismo evento.
  return NextResponse.json({ received: true });
}
