"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContenidoConfirmacion } from "@/components/reservas/contenido-confirmacion";
import type { ConfirmacionReservaPublica } from "@/types";

const INTERVALO_MS = 2000;
const INTENTOS_MAXIMOS = 10;

interface PropiedadesEsperaConfirmacion {
  paymentIntentId: string;
}

export function EsperaConfirmacionReserva({
  paymentIntentId,
}: PropiedadesEsperaConfirmacion) {
  const [confirmacion, setConfirmacion] = useState<ConfirmacionReservaPublica | null>(
    null
  );
  const [agotado, setAgotado] = useState(false);

  useEffect(() => {
    let intentos = 0;
    let cancelado = false;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    async function consultar() {
      try {
        const respuesta = await fetch(
          `/api/reservas/estado-pago?paymentIntentId=${encodeURIComponent(paymentIntentId)}`
        );
        if (respuesta.ok) {
          const resultado = await respuesta.json();
          if (!cancelado) {
            setConfirmacion(resultado.data);
          }
          return;
        }
      } catch {
        // Reintentamos en el siguiente intervalo.
      }

      intentos += 1;
      if (intentos >= INTENTOS_MAXIMOS) {
        if (!cancelado) {
          setAgotado(true);
        }
        return;
      }
      if (!cancelado) {
        temporizador = setTimeout(consultar, INTERVALO_MS);
      }
    }

    consultar();

    return () => {
      cancelado = true;
      if (temporizador) {
        clearTimeout(temporizador);
      }
    };
  }, [paymentIntentId]);

  if (confirmacion) {
    return (
      <ContenidoConfirmacion
        numero={confirmacion.numero}
        tourNombre={confirmacion.tourNombre}
        fecha={new Date(confirmacion.fecha)}
        paymentIntentId={paymentIntentId}
      />
    );
  }

  if (agotado) {
    return (
      <div className="text-center">
        <p className="text-marca-carbon">
          Tu pago se procesó correctamente. Te enviaremos el número de reserva por
          email en los próximos minutos.
        </p>
        <Link
          href="/tours"
          className="mt-6 inline-block rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
        >
          Volver a los tours
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-marca-gris">Estamos confirmando tu pago…</p>
    </div>
  );
}
