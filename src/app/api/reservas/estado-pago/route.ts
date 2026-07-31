import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { obtenerConfirmacionReservaPorPaymentIntent } from "@/lib/reservas/consultas";
import { extraerIpDeCabeceras, verificarLimiteVentana } from "@/lib/seguridad/limite-tasa";

const esquemaQuery = z.object({
  paymentIntentId: z.string().min(1),
});

// Límite generoso: la pantalla de confirmación hace polling cada 2s hasta
// 10 veces (ver espera-confirmacion.tsx), es decir hasta ~10 peticiones en
// 20s para un único checkout legítimo.
const LIMITE_PETICIONES_POR_MINUTO = 30;
const VENTANA_LIMITE_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const ip = extraerIpDeCabeceras(request.headers);
  const limite = await verificarLimiteVentana(
    `estado-pago:${ip}`,
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
