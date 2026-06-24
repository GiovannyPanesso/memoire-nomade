import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { obtenerDatosEmailReservaPorPaymentIntent } from "@/lib/reservas/consultas";
import { generarPdfReserva, nombreArchivoPdfReserva } from "@/lib/pdf/generar-pdf-reserva";
import { logger } from "@/lib/logger";

const esquemaQuery = z.object({
  paymentIntentId: z.string().min(1),
});

export async function GET(request: NextRequest) {
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
