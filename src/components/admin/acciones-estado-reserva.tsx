"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EstadoReserva } from "@prisma/client";
import { cambiarEstadoReserva } from "@/lib/reservas/acciones";

interface PropiedadesAccionesEstadoReserva {
  id: string;
  estadoActual: EstadoReserva;
}

export function AccionesEstadoReserva({
  id,
  estadoActual,
}: PropiedadesAccionesEstadoReserva) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function manejarCambio(estado: EstadoReserva) {
    setError(null);
    iniciarTransicion(async () => {
      try {
        await cambiarEstadoReserva(id, estado);
        router.refresh();
      } catch {
        setError("No se pudo actualizar el estado.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pendiente || estadoActual !== EstadoReserva.PENDIENTE}
          onClick={() => manejarCambio(EstadoReserva.CONFIRMADA)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          type="button"
          disabled={
            pendiente ||
            estadoActual === EstadoReserva.CANCELADA ||
            estadoActual === EstadoReserva.COMPLETADA
          }
          onClick={() => manejarCambio(EstadoReserva.CANCELADA)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={pendiente || estadoActual !== EstadoReserva.CONFIRMADA}
          onClick={() => manejarCambio(EstadoReserva.COMPLETADA)}
          className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-40"
        >
          Completar
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
