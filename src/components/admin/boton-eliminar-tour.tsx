"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarTour } from "@/lib/tours/acciones";

interface PropiedadesBotonEliminarTour {
  id: string;
  nombre: string;
  redirigirALista?: boolean;
}

export function BotonEliminarTour({
  id,
  nombre,
  redirigirALista,
}: PropiedadesBotonEliminarTour) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function manejarClic() {
    const confirmado = window.confirm(
      `¿Eliminar el tour "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setError(null);
    iniciarTransicion(async () => {
      try {
        await eliminarTour(id);
        if (redirigirALista) {
          router.push("/admin/tours");
        } else {
          router.refresh();
        }
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo eliminar el tour."
        );
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={manejarClic}
        disabled={pendiente}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendiente ? "Eliminando..." : "Eliminar"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
