"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarConfiguracion } from "@/lib/configuracion/acciones";
import type { ConfiguracionNegocio } from "@/types";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

interface PropiedadesFormularioConfiguracion {
  configuracionInicial: ConfiguracionNegocio;
}

export function FormularioConfiguracion({
  configuracionInicial,
}: PropiedadesFormularioConfiguracion) {
  const router = useRouter();
  const [nombreNegocio, setNombreNegocio] = useState(
    configuracionInicial.nombreNegocio
  );
  const [emailContacto, setEmailContacto] = useState(
    configuracionInicial.emailContacto
  );
  const [telefonoContacto, setTelefonoContacto] = useState(
    configuracionInicial.telefonoContacto
  );
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setGuardado(false);

    iniciarTransicion(async () => {
      try {
        await actualizarConfiguracion({
          nombreNegocio,
          emailContacto,
          telefonoContacto,
        });
        setGuardado(true);
        router.refresh();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo guardar la configuración."
        );
      }
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div>
        <label htmlFor="nombreNegocio" className="text-sm font-medium text-marca-carbon">
          Nombre del negocio
        </label>
        <input
          id="nombreNegocio"
          type="text"
          required
          value={nombreNegocio}
          onChange={(evento) => setNombreNegocio(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="emailContacto" className="text-sm font-medium text-marca-carbon">
          Email de contacto
        </label>
        <input
          id="emailContacto"
          type="email"
          required
          value={emailContacto}
          onChange={(evento) => setEmailContacto(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="telefonoContacto" className="text-sm font-medium text-marca-carbon">
          Teléfono de contacto
        </label>
        <input
          id="telefonoContacto"
          type="text"
          required
          value={telefonoContacto}
          onChange={(evento) => setTelefonoContacto(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {guardado ? (
        <p className="text-sm text-emerald-700">Cambios guardados.</p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-marca-dorado px-5 py-2.5 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
