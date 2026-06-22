"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EstadoReserva } from "@prisma/client";
import type { TourParaFiltro } from "@/types";

const ETIQUETAS_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
};

interface PropiedadesFiltrosReservas {
  tours: TourParaFiltro[];
}

export function FiltrosReservas({ tours }: PropiedadesFiltrosReservas) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") ?? "");

  function actualizarFiltro(clave: string, valor: string) {
    const parametros = new URLSearchParams(searchParams.toString());

    if (valor) {
      parametros.set(clave, valor);
    } else {
      parametros.delete(clave);
    }

    parametros.delete("pagina");
    router.push(`/admin/reservas?${parametros.toString()}`);
  }

  function manejarEnvioBusqueda(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    actualizarFiltro("busqueda", busqueda);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-marca-dorado/20 bg-white p-4">
      <form
        onSubmit={manejarEnvioBusqueda}
        className="flex items-end gap-2"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="busqueda"
            className="text-xs font-medium text-marca-gris"
          >
            Cliente o email
          </label>
          <input
            id="busqueda"
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar..."
            className="w-56 rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-col gap-1">
        <label htmlFor="estado" className="text-xs font-medium text-marca-gris">
          Estado
        </label>
        <select
          id="estado"
          defaultValue={searchParams.get("estado") ?? ""}
          onChange={(evento) => actualizarFiltro("estado", evento.target.value)}
          className="rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
        >
          <option value="">Todos</option>
          {Object.values(EstadoReserva).map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS_ESTADO[estado]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tourId" className="text-xs font-medium text-marca-gris">
          Tour
        </label>
        <select
          id="tourId"
          defaultValue={searchParams.get("tourId") ?? ""}
          onChange={(evento) => actualizarFiltro("tourId", evento.target.value)}
          className="rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
        >
          <option value="">Todos</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
