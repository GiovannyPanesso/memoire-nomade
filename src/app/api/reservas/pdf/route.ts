import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { obtenerDatosEmailReservaPorPaymentIntent } from "@/lib/reservas/consultas";
import { generarPdfReserva, nombreArchivoPdfReserva } from "@/lib/pdf/generar-pdf-reserva";
import { extraerIpDeCabeceras, verificarLimiteVentana } from "@/lib/seguridad/limite-tasa";
import { logger } from "@/lib/logger";

const esquemaQuery = z.object({
  paymentIntentId: z.string().min(1),
});

// La generación de PDF genera un proceso Node por petición: límite bajo
// aposta para no dejar que se abuse de un endpoint caro en cómputo.
const LIMITE_PETICIONES_POR_MINUTO = 10;
const VENTANA_LIMITE_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const ip = extraerIpDeCabeceras(request.headers);
  const limite = await verificarLimiteVentana(
    `reservas-pdf:${ip}`,
    LIMITE_PETICIONES_POR_MINUTO,
    VENTANA_LIMITE_MS
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Intenta de nuevo en un momento." },
      { status: 429 }
    );
  }

  const resultado = esquemaQuery.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Falta el identificador del pago" },
      { status: 400 }
    );
  }

  const datos = await obtenerDatosEmailReservaPorPaymentIntent(
    resultado.data.paymentIntentId
  );

  if (!datos) {
    return NextResponse.json(
      { error: "No se encontró la reserva para ese pago" },
      { status: 404 }
    );
  }

  try {
    const pdf = await generarPdfReserva(datos);
    const cuerpoPdf = new Uint8Array(pdf);

    return new NextResponse(new Blob([cuerpoPdf], { type: "application/pdf" }), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivoPdfReserva(datos.numero)}"`,
      },
    });
  } catch (error) {
    logger.error("Error al generar el PDF de la reserva", { error, numero: datos.numero });
    return NextResponse.json(
      { error: "No se pudo generar el PDF de la reserva" },
      { status: 500 }
    );
  }
}
