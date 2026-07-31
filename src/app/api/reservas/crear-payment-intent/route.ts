import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/cliente";
import { calcularPrecioTotal } from "@/lib/tours/calculadora-precio";
import { esFechaPasada } from "@/lib/disponibilidad/fechas";
import { verificarFechaDisponible } from "@/lib/disponibilidad/consultas";
import { crearPaymentIntentReserva } from "@/lib/stripe/payment-intent";
import { codificarCantidadesOpcionales } from "@/lib/reservas/opcionales";
import { extraerIpDeCabeceras, verificarLimiteVentana } from "@/lib/seguridad/limite-tasa";
import { logger } from "@/lib/logger";

const LONGITUD_MAXIMA_MENSAJE = 500;
const LIMITE_PETICIONES_POR_MINUTO = 10;
const VENTANA_LIMITE_MS = 60 * 1000;

const esquemaCrearPaymentIntent = z.object({
  tourSlug: z.string().min(1, "Falta el tour"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  numeroAdultos: z.number().int().min(1, "Debe haber al menos un adulto"),
  edadesNinos: z.array(z.number().int().min(0).max(17)).default([]),
  cantidadesOpcionales: z.record(z.string(), z.number().int().min(0)).default({}),
  nombreCliente: z.string().trim().min(1, "El nombre es obligatorio"),
  emailCliente: z.string().trim().email("Debe ser un email válido"),
  telefonoCliente: z.string().trim().min(1, "El teléfono es obligatorio"),
  paisCliente: z.string().trim().min(1, "El país es obligatorio"),
  mensajeCliente: z.string().trim().max(LONGITUD_MAXIMA_MENSAJE).optional(),
});

export async function POST(request: Request) {
  const ip = extraerIpDeCabeceras(request.headers);
  const limite = await verificarLimiteVentana(
    `crear-payment-intent:${ip}`,
    LIMITE_PETICIONES_POR_MINUTO,
    VENTANA_LIMITE_MS
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Intenta de nuevo en un momento." },
      { status: 429 }
    );
  }

  const cuerpoCrudo = await request.json();
  const resultado = esquemaCrearPaymentIntent.safeParse(cuerpoCrudo);

  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const datos = resultado.data;

  if (esFechaPasada(datos.fecha)) {
    return NextResponse.json(
      { error: "La fecha seleccionada ya pasó" },
      { status: 400 }
    );
  }

  try {
    const tour = await prisma.tour.findFirst({
      where: { slug: datos.tourSlug, activo: true },
      include: { tarifas: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 });
    }

    const disponible = await verificarFechaDisponible(tour.id, datos.fecha);
    if (!disponible) {
      return NextResponse.json(
        { error: "La fecha seleccionada no está disponible" },
        { status: 400 }
      );
    }

    const tarifas = tour.tarifas.map((tarifa) => ({
      id: tarifa.id,
      minPersonas: tarifa.minPersonas,
      maxPersonas: tarifa.maxPersonas,
      precio: tarifa.precio.toNumber(),
      esNino: tarifa.esNino,
      edadMaxNino: tarifa.edadMaxNino,
      esOpcional: tarifa.esOpcional,
      nombreOpcional: tarifa.nombreOpcional,
    }));

    const totalPersonas = datos.numeroAdultos + datos.edadesNinos.length;
    const cantidadExcedida = Object.entries(datos.cantidadesOpcionales).some(
      ([, cantidad]) => cantidad > totalPersonas
    );
    if (cantidadExcedida) {
      return NextResponse.json(
        { error: "La cantidad de un opcional no puede superar el tamaño del grupo" },
        { status: 400 }
      );
    }

    const resultadoPrecio = calcularPrecioTotal({
      tarifas,
      numeroAdultos: datos.numeroAdultos,
      edadesNinos: datos.edadesNinos,
      cantidadesOpcionales: datos.cantidadesOpcionales,
    });

    if (resultadoPrecio.precioTotal <= 0) {
      return NextResponse.json(
        { error: "No se pudo calcular el precio de la reserva" },
        { status: 400 }
      );
    }

    const paymentIntent = await crearPaymentIntentReserva({
      precioTotal: resultadoPrecio.precioTotal,
      metadata: {
        tourId: tour.id,
        tourSlug: tour.slug,
        fecha: datos.fecha,
        numeroAdultos: String(datos.numeroAdultos),
        edadesNinos: datos.edadesNinos.join(","),
        opcionalesCantidades: codificarCantidadesOpcionales(datos.cantidadesOpcionales),
        nombreCliente: datos.nombreCliente,
        emailCliente: datos.emailCliente,
        telefonoCliente: datos.telefonoCliente,
        paisCliente: datos.paisCliente,
        mensajeCliente: datos.mensajeCliente ?? "",
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe no devolvió un client_secret");
    }

    return NextResponse.json({
      data: {
        clientSecret: paymentIntent.client_secret,
        precioTotal: resultadoPrecio.precioTotal,
      },
    });
  } catch (error) {
    logger.error("Error al crear el payment intent de una reserva", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
