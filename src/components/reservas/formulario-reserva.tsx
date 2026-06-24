"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { obtenerPromesaStripe } from "@/lib/stripe/promesa-stripe";
import { PAISES } from "@/lib/reservas/paises";
import { FormularioPago } from "@/components/reservas/formulario-pago";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

type PasoReserva = "datos" | "pago";

interface DatosClienteReserva {
  nombreCliente: string;
  emailCliente: string;
  confirmarEmailCliente: string;
  telefonoCliente: string;
  paisCliente: string;
  mensajeCliente: string;
  aceptaPoliticas: boolean;
}

const DATOS_CLIENTE_INICIALES: DatosClienteReserva = {
  nombreCliente: "",
  emailCliente: "",
  confirmarEmailCliente: "",
  telefonoCliente: "",
  paisCliente: "",
  mensajeCliente: "",
  aceptaPoliticas: false,
};

interface PropiedadesFormularioReserva {
  tourSlug: string;
  tourNombre: string;
  fecha: string;
  numeroAdultos: number;
  edadesNinos: number[];
  cantidadesOpcionales: Record<string, number>;
  precioTotal: number;
}

export function FormularioReserva({
  tourSlug,
  tourNombre,
  fecha,
  numeroAdultos,
  edadesNinos,
  cantidadesOpcionales,
  precioTotal,
}: PropiedadesFormularioReserva) {
  const [paso, setPaso] = useState<PasoReserva>("datos");
  const [datosCliente, setDatosCliente] = useState<DatosClienteReserva>(
    DATOS_CLIENTE_INICIALES
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function actualizarCampo<K extends keyof DatosClienteReserva>(
    campo: K,
    valor: DatosClienteReserva[K]
  ) {
    setDatosCliente((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function manejarContinuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (datosCliente.emailCliente !== datosCliente.confirmarEmailCliente) {
      setError("Los emails no coinciden.");
      return;
    }
    if (!datosCliente.aceptaPoliticas) {
      setError("Debes aceptar las políticas de cancelación.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/reservas/crear-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourSlug,
          fecha,
          numeroAdultos,
          edadesNinos,
          cantidadesOpcionales,
          nombreCliente: datosCliente.nombreCliente,
          emailCliente: datosCliente.emailCliente,
          telefonoCliente: datosCliente.telefonoCliente,
          paisCliente: datosCliente.paisCliente,
          mensajeCliente: datosCliente.mensajeCliente,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setError(resultado.error ?? "No se pudo iniciar el pago.");
        return;
      }

      setClientSecret(resultado.data.clientSecret);
      setPaso("pago");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (paso === "pago" && clientSecret) {
    return (
      <Elements stripe={obtenerPromesaStripe()} options={{ clientSecret, locale: "es" }}>
        <FormularioPago
          tourSlug={tourSlug}
          tourNombre={tourNombre}
          precioTotal={precioTotal}
          onVolver={() => setPaso("datos")}
        />
      </Elements>
    );
  }

  return (
    <form
      onSubmit={manejarContinuar}
      className="space-y-5 rounded-lg border border-marca-dorado/20 bg-white p-6"
    >
      <h2 className="font-serif text-xl text-marca-carbon">Tus datos</h2>

      <div>
        <label className="text-sm font-medium text-marca-carbon">Nombre completo</label>
        <input
          required
          type="text"
          value={datosCliente.nombreCliente}
          onChange={(evento) => actualizarCampo("nombreCliente", evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-marca-carbon">Email</label>
          <input
            required
            type="email"
            value={datosCliente.emailCliente}
            onChange={(evento) => actualizarCampo("emailCliente", evento.target.value)}
            className={`mt-1 ${ESTILOS_INPUT}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-marca-carbon">Confirmar email</label>
          <input
            required
            type="email"
            value={datosCliente.confirmarEmailCliente}
            onChange={(evento) =>
              actualizarCampo("confirmarEmailCliente", evento.target.value)
            }
            className={`mt-1 ${ESTILOS_INPUT}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-marca-carbon">Teléfono</label>
          <input
            required
            type="tel"
            placeholder="+34 600 000 000"
            value={datosCliente.telefonoCliente}
            onChange={(evento) => actualizarCampo("telefonoCliente", evento.target.value)}
            className={`mt-1 ${ESTILOS_INPUT}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-marca-carbon">País de origen</label>
          <select
            required
            value={datosCliente.paisCliente}
            onChange={(evento) => actualizarCampo("paisCliente", evento.target.value)}
            className={`mt-1 ${ESTILOS_INPUT}`}
          >
            <option value="" disabled>
              Selecciona tu país
            </option>
            {PAISES.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-marca-carbon">
          Mensaje para el guía (opcional)
        </label>
        <textarea
          rows={3}
          value={datosCliente.mensajeCliente}
          onChange={(evento) => actualizarCampo("mensajeCliente", evento.target.value)}
          placeholder="Alergias, movilidad reducida, ocasión especial…"
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-marca-carbon">
        <input
          required
          type="checkbox"
          checked={datosCliente.aceptaPoliticas}
          onChange={(evento) => actualizarCampo("aceptaPoliticas", evento.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-marca-gris/30 text-marca-dorado focus:ring-marca-dorado"
        />
        Acepto las políticas de cancelación
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Continuando…" : "Continuar al pago"}
      </button>
    </form>
  );
}
