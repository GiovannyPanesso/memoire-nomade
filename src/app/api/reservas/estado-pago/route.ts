import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { obtenerConfirmacionReservaPorPaymentIntent } from "@/lib/reservas/consultas";

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

  const confirmacion = await obtenerConfirmacionReservaPorPaymentIntent(
    resultado.data.paymentIntentId
  );

  if (!confirmacion) {
    return NextResponse.json(
      { error: "La reserva todavía se está confirmando" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: confirmacion });
}
