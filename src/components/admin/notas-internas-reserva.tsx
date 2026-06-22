"use client";

import { useState, useTransition } from "react";
import { actualizarNotasReserva } from "@/lib/reservas/acciones";

interface PropiedadesNotasInternasReserva {
  id: string;
  notasIniciales: string;
}

export function NotasInternasReserva({
  id,
  notasIniciales,
}: PropiedadesNotasInternasReserva) {
  const [notas, setNotas] = useState(notasIniciales);
  const [pendiente, iniciarTransicion] = useTransition();
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function manejarGuardar() {
    setError(null);
    setGuardado(false);
    iniciarTransicion(async () => {
      try {
        await actualizarNotasReserva(id, notas);
        setGuardado(true);
      } catch {
        setError("No se pudieron guardar las notas.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notas}
        onChange={(evento) => {
          setNotas(evento.target.value);
          setGuardado(false);
        }}
        rows={4}
        placeholder="Anotaciones internas sobre esta reserva..."
        className="w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm text-marca-carbon outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={manejarGuardar}
          disabled={pendiente}
          className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente ? "Guardando..." : "Guardar notas"}
        </button>
        {guardado ? (
          <span className="text-sm text-emerald-700">Guardado</span>
        ) : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
