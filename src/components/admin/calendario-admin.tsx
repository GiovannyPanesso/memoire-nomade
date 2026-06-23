"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  LOCALE_ES,
  formatearFechaISO,
  parsearFechaISO,
} from "@/lib/disponibilidad/fechas";
import {
  obtenerCalendarioMes,
  obtenerDetalleDia,
} from "@/lib/disponibilidad/consultas";
import {
  bloquearFecha,
  desbloquearFecha,
  bloquearRango,
  desbloquearRango,
} from "@/lib/disponibilidad/acciones";
import { BadgeEstado } from "@/components/admin/badge-estado";
import type {
  TourParaFiltro,
  DiaCalendarioAdmin,
  DetalleDiaDisponibilidad,
} from "@/types";

const formatoFechaLarga = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

const CLASES_MODIFICADORES = {
  disponible: "!bg-emerald-100 !text-emerald-900 rounded-md",
  conReservas: "!bg-marca-dorado/40 !text-marca-carbon font-semibold rounded-md",
  bloqueado: "!bg-red-200 !text-red-900 rounded-md",
  pasado: "!text-marca-gris/40",
};

interface PropiedadesLeyendaColor {
  color: string;
  etiqueta: string;
}

function LeyendaColor({ color, etiqueta }: PropiedadesLeyendaColor) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {etiqueta}
    </span>
  );
}

interface PropiedadesCalendarioAdmin {
  tours: TourParaFiltro[];
}

export function CalendarioAdmin({ tours }: PropiedadesCalendarioAdmin) {
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");
  const [mes, setMes] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });
  const [dias, setDias] = useState<DiaCalendarioAdmin[]>([]);
  const [cargandoMes, setCargandoMes] = useState(false);

  const [modoRango, setModoRango] = useState(false);
  const [rango, setRango] = useState<DateRange | undefined>(undefined);
  const [motivoRango, setMotivoRango] = useState("");

  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleDiaDisponibilidad | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [motivo, setMotivo] = useState("");

  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cargarMes = useCallback(() => {
    if (!tourId) return;
    setCargandoMes(true);
    setError(null);
    obtenerCalendarioMes(tourId, mes.getFullYear(), mes.getMonth() + 1)
      .then(setDias)
      .catch((errorCapturado) =>
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo cargar el calendario."
        )
      )
      .finally(() => setCargandoMes(false));
  }, [tourId, mes]);

  useEffect(() => {
    cargarMes();
  }, [cargarMes]);

  function refrescarDetalle(fechaIso: string) {
    return obtenerDetalleDia(tourId, fechaIso).then(setDetalle);
  }

  function cambiarTour(nuevoTourId: string) {
    setTourId(nuevoTourId);
    setDiaSeleccionado(null);
    setDetalle(null);
    setRango(undefined);
  }

  function alternarModoRango(activo: boolean) {
    setModoRango(activo);
    setRango(undefined);
    setDiaSeleccionado(null);
    setDetalle(null);
  }

  function seleccionarDia(fechaIso: string) {
    setDiaSeleccionado(fechaIso);
    setMotivo("");
    setDetalle(null);
    setCargandoDetalle(true);
    refrescarDetalle(fechaIso)
      .catch((errorCapturado) =>
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo cargar el detalle del día."
        )
      )
      .finally(() => setCargandoDetalle(false));
  }

  function manejarBloquearDia() {
    if (!diaSeleccionado) return;
    setError(null);
    iniciarTransicion(async () => {
      try {
        await bloquearFecha(tourId, diaSeleccionado, motivo || undefined);
        setMotivo("");
        cargarMes();
        await refrescarDetalle(diaSeleccionado);
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo bloquear el día."
        );
      }
    });
  }

  function manejarDesbloquearDia() {
    if (!diaSeleccionado) return;
    setError(null);
    iniciarTransicion(async () => {
      try {
        await desbloquearFecha(tourId, diaSeleccionado);
        cargarMes();
        await refrescarDetalle(diaSeleccionado);
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo desbloquear el día."
        );
      }
    });
  }

  function manejarBloquearRango() {
    if (!rango?.from || !rango?.to) return;
    setError(null);
    const fechaInicio = formatearFechaISO(rango.from);
    const fechaFin = formatearFechaISO(rango.to);
    iniciarTransicion(async () => {
      try {
        await bloquearRango(tourId, fechaInicio, fechaFin, motivoRango || undefined);
        setRango(undefined);
        setMotivoRango("");
        cargarMes();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo bloquear el rango."
        );
      }
    });
  }

  function manejarDesbloquearRango() {
    if (!rango?.from || !rango?.to) return;
    setError(null);
    const fechaInicio = formatearFechaISO(rango.from);
    const fechaFin = formatearFechaISO(rango.to);
    iniciarTransicion(async () => {
      try {
        await desbloquearRango(tourId, fechaInicio, fechaFin);
        setRango(undefined);
        cargarMes();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo desbloquear el rango."
        );
      }
    });
  }

  const diasDisponibles = dias
    .filter((dia) => dia.estado === "DISPONIBLE")
    .map((dia) => parsearFechaISO(dia.fecha));
  const diasConReservas = dias
    .filter((dia) => dia.estado === "CON_RESERVAS")
    .map((dia) => parsearFechaISO(dia.fecha));
  const diasBloqueados = dias
    .filter((dia) => dia.estado === "BLOQUEADO")
    .map((dia) => parsearFechaISO(dia.fecha));
  const diasPasados = dias
    .filter((dia) => dia.estado === "PASADO")
    .map((dia) => parsearFechaISO(dia.fecha));

  const modificadores = {
    disponible: diasDisponibles,
    conReservas: diasConReservas,
    bloqueado: diasBloqueados,
    pasado: diasPasados,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-marca-dorado/20 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="tourId" className="text-xs font-medium text-marca-gris">
            Tour
          </label>
          <select
            id="tourId"
            value={tourId}
            onChange={(evento) => cambiarTour(evento.target.value)}
            className="rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
          >
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.nombre}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-marca-carbon">
          <input
            type="checkbox"
            checked={modoRango}
            onChange={(evento) => alternarModoRango(evento.target.checked)}
            className="h-4 w-4 rounded border-marca-gris/30 text-marca-dorado focus:ring-marca-dorado"
          />
          Bloqueo múltiple (seleccionar rango)
        </label>
      </div>

      {modoRango ? (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-marca-dorado/20 bg-white p-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="motivoRango" className="text-xs font-medium text-marca-gris">
              Motivo del bloqueo (opcional)
            </label>
            <input
              id="motivoRango"
              type="text"
              value={motivoRango}
              onChange={(evento) => setMotivoRango(evento.target.value)}
              placeholder="Ej: Vacaciones del guía"
              className={`w-64 ${ESTILOS_INPUT}`}
            />
          </div>
          <button
            type="button"
            disabled={pendiente || !rango?.from || !rango?.to}
            onClick={manejarBloquearRango}
            className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bloquear rango
          </button>
          <button
            type="button"
            disabled={pendiente || !rango?.from || !rango?.to}
            onClick={manejarDesbloquearRango}
            className="rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Desbloquear rango
          </button>
          {rango?.from ? (
            <p className="text-xs text-marca-gris">
              {formatoFechaLarga.format(rango.from)}
              {rango.to ? ` — ${formatoFechaLarga.format(rango.to)}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="rounded-lg border border-marca-dorado/20 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-4 text-xs text-marca-gris">
            <LeyendaColor color="bg-emerald-100" etiqueta="Disponible" />
            <LeyendaColor color="bg-marca-dorado/40" etiqueta="Con reservas" />
            <LeyendaColor color="bg-red-200" etiqueta="Bloqueado" />
            <LeyendaColor color="bg-marca-gris/20" etiqueta="Pasado" />
          </div>

          {cargandoMes ? (
            <p className="mb-2 text-xs text-marca-gris">Cargando calendario...</p>
          ) : null}

          {modoRango ? (
            <DayPicker
              mode="range"
              locale={LOCALE_ES}
              month={mes}
              onMonthChange={setMes}
              selected={rango}
              onSelect={setRango}
              disabled={diasPasados}
              modifiers={modificadores}
              modifiersClassNames={CLASES_MODIFICADORES}
            />
          ) : (
            <DayPicker
              mode="single"
              locale={LOCALE_ES}
              month={mes}
              onMonthChange={setMes}
              selected={diaSeleccionado ? parsearFechaISO(diaSeleccionado) : undefined}
              onDayClick={(dia) => seleccionarDia(formatearFechaISO(dia))}
              disabled={diasPasados}
              modifiers={modificadores}
              modifiersClassNames={CLASES_MODIFICADORES}
            />
          )}
        </div>

        {!modoRango && diaSeleccionado ? (
          <aside className="w-full rounded-lg border border-marca-dorado/20 bg-white p-4 lg:w-80">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-serif text-base text-marca-carbon">
                {formatoFechaLarga.format(parsearFechaISO(diaSeleccionado))}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDiaSeleccionado(null);
                  setDetalle(null);
                }}
                className="text-sm text-marca-gris hover:text-marca-carbon"
              >
                Cerrar
              </button>
            </div>

            {cargandoDetalle ? (
              <p className="mt-4 text-sm text-marca-gris">Cargando...</p>
            ) : detalle ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      detalle.bloqueado
                        ? "bg-red-100 text-red-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {detalle.bloqueado ? "Bloqueado" : "Disponible"}
                  </span>
                  {detalle.motivo ? (
                    <p className="mt-1 text-xs text-marca-gris">
                      Motivo: {detalle.motivo}
                    </p>
                  ) : null}
                </div>

                {detalle.bloqueado ? (
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={manejarDesbloquearDia}
                    className="w-full rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Desbloquear este día
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={motivo}
                      onChange={(evento) => setMotivo(evento.target.value)}
                      placeholder="Motivo del bloqueo (opcional)"
                      className={ESTILOS_INPUT}
                    />
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={manejarBloquearDia}
                      className="w-full rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Bloquear este día
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-marca-carbon">
                    Reservas ({detalle.reservas.length})
                  </h3>
                  {detalle.reservas.length === 0 ? (
                    <p className="mt-2 text-sm text-marca-gris">
                      Sin reservas este día.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {detalle.reservas.map((reserva) => (
                        <li
                          key={reserva.id}
                          className="rounded-md bg-marca-crema px-3 py-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-marca-carbon">
                              {reserva.nombreCliente}
                            </span>
                            <BadgeEstado estado={reserva.estado} />
                          </div>
                          <p className="mt-1 text-xs text-marca-gris">
                            Reservado a las {formatoHora.format(reserva.creadoEn)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
