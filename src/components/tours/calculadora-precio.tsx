"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { CalendarioDisponibilidad } from "@/components/tours/calendario-disponibilidad";
import { calcularPrecioTotal } from "@/lib/tours/calculadora-precio";
import { formatearFechaISO } from "@/lib/disponibilidad/fechas";
import { codificarCantidadesOpcionales } from "@/lib/reservas/opcionales";
import type { TarifaTourDetalle } from "@/types";

const EDAD_NINO_PREDETERMINADA = 8;
const MINIMO_ADULTOS = 1;

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

interface PropiedadesCalculadoraPrecio {
  tourId: string;
  slug: string;
  tarifas: TarifaTourDetalle[];
}

export function CalculadoraPrecio({
  tourId,
  slug,
  tarifas,
}: PropiedadesCalculadoraPrecio) {
  const [numeroAdultos, setNumeroAdultos] = useState(2);
  const [edadesNinos, setEdadesNinos] = useState<number[]>([]);
  const [cantidadesOpcionales, setCantidadesOpcionales] = useState<
    Record<string, number>
  >({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(
    undefined
  );

  const tarifasOpcionales = tarifas.filter((tarifa) => tarifa.esOpcional);
  const totalPersonas = numeroAdultos + edadesNinos.length;

  // El tamaño del grupo puede reducirse después de elegir cantidades de
  // opcionales; recalculamos el límite aquí en vez de mutar el estado.
  const cantidadesOpcionalesClamped = tarifasOpcionales.reduce<Record<string, number>>(
    (acumulado, tarifa) => {
      acumulado[tarifa.id] = Math.min(cantidadesOpcionales[tarifa.id] ?? 0, totalPersonas);
      return acumulado;
    },
    {}
  );

  const resultado = calcularPrecioTotal({
    tarifas,
    numeroAdultos,
    edadesNinos,
    cantidadesOpcionales: cantidadesOpcionalesClamped,
  });

  function agregarNino() {
    setEdadesNinos((anterior) => [...anterior, EDAD_NINO_PREDETERMINADA]);
  }

  function actualizarEdadNino(indice: number, edad: number) {
    setEdadesNinos((anterior) =>
      anterior.map((valor, i) => (i === indice ? edad : valor))
    );
  }

  function eliminarNino(indice: number) {
    setEdadesNinos((anterior) => anterior.filter((_, i) => i !== indice));
  }

  function actualizarCantidadOpcional(id: string, delta: number) {
    setCantidadesOpcionales((anterior) => {
      const actual = anterior[id] ?? 0;
      const siguiente = Math.min(Math.max(actual + delta, 0), totalPersonas);
      return { ...anterior, [id]: siguiente };
    });
  }

  const hayOpcionalesSeleccionados = Object.values(cantidadesOpcionalesClamped).some(
    (cantidad) => cantidad > 0
  );

  const parametrosReserva = new URLSearchParams();
  parametrosReserva.set("tour", slug);
  if (fechaSeleccionada) {
    parametrosReserva.set("fecha", formatearFechaISO(fechaSeleccionada));
  }
  parametrosReserva.set("adultos", String(numeroAdultos));
  if (edadesNinos.length > 0) {
    parametrosReserva.set("edadesNinos", edadesNinos.join(","));
  }
  if (hayOpcionalesSeleccionados) {
    parametrosReserva.set(
      "opcionales",
      codificarCantidadesOpcionales(cantidadesOpcionalesClamped)
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h3 className="font-serif text-lg text-marca-carbon">
          Elige la fecha de tu tour
        </h3>
        <div className="mt-4">
          <CalendarioDisponibilidad
            tourId={tourId}
            onFechaSeleccionada={setFechaSeleccionada}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-serif text-lg text-marca-carbon">Adultos</h3>
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setNumeroAdultos((anterior) =>
                  Math.max(MINIMO_ADULTOS, anterior - 1)
                )
              }
              disabled={numeroAdultos <= MINIMO_ADULTOS}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-marca-gris/30 text-marca-carbon transition hover:border-marca-dorado disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Quitar un adulto"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-medium text-marca-carbon">
              {numeroAdultos}
            </span>
            <button
              type="button"
              onClick={() => setNumeroAdultos((anterior) => anterior + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-marca-gris/30 text-marca-carbon transition hover:border-marca-dorado"
              aria-label="Añadir un adulto"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-marca-carbon">Niños</h3>
            <button
              type="button"
              onClick={agregarNino}
              className="text-sm font-medium text-marca-dorado-oscuro hover:underline"
            >
              + Añadir niño
            </button>
          </div>

          {edadesNinos.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {edadesNinos.map((edad, indice) => (
                <li key={indice} className="flex items-center gap-3">
                  <label className="text-sm text-marca-gris">
                    Edad del niño {indice + 1}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={17}
                    value={edad}
                    onChange={(evento) =>
                      actualizarEdadNino(indice, Number(evento.target.value))
                    }
                    className="w-20 rounded-md border border-marca-gris/30 px-2 py-1 text-sm outline-none focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarNino(indice)}
                    aria-label="Quitar niño"
                    className="text-marca-gris transition hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-marca-gris">
              No has añadido niños a la reserva.
            </p>
          )}
        </div>

        {tarifasOpcionales.length > 0 ? (
          <div>
            <h3 className="font-serif text-lg text-marca-carbon">Opcionales</h3>
            <p className="mt-1 text-xs text-marca-gris">
              Elige cuántas personas del grupo quieren cada opcional — no tiene
              que ser todo el grupo.
            </p>
            <ul className="mt-2 space-y-3">
              {tarifasOpcionales.map((tarifa) => {
                const cantidad = cantidadesOpcionalesClamped[tarifa.id] ?? 0;
                return (
                  <li
                    key={tarifa.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm text-marca-carbon">{tarifa.nombreOpcional}</p>
                      <p className="text-xs text-marca-gris">
                        {formatoMoneda.format(tarifa.precio)} / persona
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => actualizarCantidadOpcional(tarifa.id, -1)}
                        disabled={cantidad <= 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-marca-gris/30 text-marca-carbon transition hover:border-marca-dorado disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Quitar una unidad de ${tarifa.nombreOpcional}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium text-marca-carbon">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidadOpcional(tarifa.id, 1)}
                        disabled={cantidad >= totalPersonas}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-marca-gris/30 text-marca-carbon transition hover:border-marca-dorado disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Añadir una unidad de ${tarifa.nombreOpcional}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="rounded-lg border border-marca-dorado/20 bg-marca-crema p-5">
          <div className="space-y-1 text-sm text-marca-carbon">
            <div className="flex justify-between">
              <span>Adultos</span>
              <span>{formatoMoneda.format(resultado.precioAdultos)}</span>
            </div>
            {edadesNinos.length > 0 ? (
              <div className="flex justify-between">
                <span>Niños</span>
                <span>{formatoMoneda.format(resultado.precioNinos)}</span>
              </div>
            ) : null}
            {hayOpcionalesSeleccionados ? (
              <div className="flex justify-between">
                <span>Opcionales</span>
                <span>{formatoMoneda.format(resultado.precioOpcionales)}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-marca-dorado/20 pt-3">
            <span className="font-serif text-lg text-marca-carbon">Total</span>
            <span className="font-serif text-2xl text-marca-dorado-oscuro">
              {formatoMoneda.format(resultado.precioTotal)}
            </span>
          </div>
        </div>

        {fechaSeleccionada ? (
          <p className="text-sm text-marca-gris">
            Fecha seleccionada: {formatoFecha.format(fechaSeleccionada)}
          </p>
        ) : (
          <p className="text-sm text-marca-gris">
            Selecciona una fecha en el calendario para continuar.
          </p>
        )}

        {fechaSeleccionada ? (
          <Link
            href={`/reserva?${parametrosReserva.toString()}`}
            className="block w-full rounded-md bg-marca-dorado px-6 py-3 text-center text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
          >
            Reservar ahora
          </Link>
        ) : (
          <span className="block w-full cursor-not-allowed rounded-md bg-marca-gris/20 px-6 py-3 text-center text-sm font-medium text-marca-gris">
            Reservar ahora
          </span>
        )}
      </div>
    </div>
  );
}
