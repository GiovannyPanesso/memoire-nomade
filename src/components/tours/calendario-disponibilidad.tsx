"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { ActiveModifiers } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { LOCALE_ES, parsearFechaISO } from "@/lib/disponibilidad/fechas";
import type { DisponibilidadPublicaTour } from "@/types";

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ESTILOS_SELECT =
  "rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

interface PropiedadesCalendarioDisponibilidad {
  tourId: string;
  onFechaSeleccionada: (fecha: Date) => void;
}

export function CalendarioDisponibilidad({
  tourId,
  onFechaSeleccionada,
}: PropiedadesCalendarioDisponibilidad) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [mes, setMes] = useState(inicioMesActual);
  const [mesFiltro, setMesFiltro] = useState(hoy.getMonth());
  const [anioFiltro, setAnioFiltro] = useState(hoy.getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(
    undefined
  );
  const [fechasNoDisponibles, setFechasNoDisponibles] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const mesIso = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, "0")}`;
    setCargando(true);

    fetch(
      `/api/tours/${tourId}/disponibilidad?mesInicio=${mesIso}&mesFin=${mesIso}`
    )
      .then((respuesta) => respuesta.json())
      .then((cuerpo: { data?: DisponibilidadPublicaTour }) => {
        setFechasNoDisponibles(cuerpo.data?.fechasNoDisponibles ?? []);
      })
      .catch(() => setFechasNoDisponibles([]))
      .finally(() => setCargando(false));
  }, [tourId, mes]);

  function manejarIrAMes() {
    const objetivo = new Date(anioFiltro, mesFiltro, 1);
    setMes(objetivo < inicioMesActual ? inicioMesActual : objetivo);
  }

  function manejarSeleccionDia(dia: Date, modificadores: ActiveModifiers) {
    if (modificadores.disabled) return;
    setFechaSeleccionada(dia);
    onFechaSeleccionada(dia);
  }

  const diasNoDisponibles = fechasNoDisponibles.map(parsearFechaISO);
  const anioActual = hoy.getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="mesFiltro" className="text-xs font-medium text-marca-gris">
            Mes
          </label>
          <select
            id="mesFiltro"
            value={mesFiltro}
            onChange={(evento) => setMesFiltro(Number(evento.target.value))}
            className={ESTILOS_SELECT}
          >
            {NOMBRES_MESES.map((nombreMes, indice) => (
              <option key={nombreMes} value={indice}>
                {nombreMes}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="anioFiltro" className="text-xs font-medium text-marca-gris">
            Año
          </label>
          <select
            id="anioFiltro"
            value={anioFiltro}
            onChange={(evento) => setAnioFiltro(Number(evento.target.value))}
            className={ESTILOS_SELECT}
          >
            <option value={anioActual}>{anioActual}</option>
            <option value={anioActual + 1}>{anioActual + 1}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={manejarIrAMes}
          className="rounded-md bg-marca-dorado px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
        >
          Ir
        </button>
      </div>

      {cargando ? (
        <p className="text-xs text-marca-gris">Cargando disponibilidad...</p>
      ) : null}

      <DayPicker
        mode="single"
        locale={LOCALE_ES}
        month={mes}
        onMonthChange={setMes}
        fromMonth={inicioMesActual}
        selected={fechaSeleccionada}
        onDayClick={manejarSeleccionDia}
        disabled={[{ before: hoy }, ...diasNoDisponibles]}
        modifiers={{ noDisponible: diasNoDisponibles }}
        modifiersClassNames={{
          noDisponible: "!text-marca-gris/50 line-through",
          disabled: "!text-marca-gris/30",
          selected: "!bg-marca-dorado !text-white",
        }}
      />
    </div>
  );
}
