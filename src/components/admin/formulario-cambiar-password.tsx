"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { cambiarPasswordPropia } from "@/lib/configuracion/acciones";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

export function FormularioCambiarPassword() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [actualizado, setActualizado] = useState(false);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setActualizado(false);

    if (passwordNueva !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    iniciarTransicion(async () => {
      try {
        await cambiarPasswordPropia({
          passwordActual,
          passwordNueva,
          confirmarPassword,
        });
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");
        setActualizado(true);
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo cambiar la contraseña."
        );
      }
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div>
        <label htmlFor="passwordActual" className="text-sm font-medium text-marca-carbon">
          Contraseña actual
        </label>
        <input
          id="passwordActual"
          type="password"
          required
          value={passwordActual}
          onChange={(evento) => setPasswordActual(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="passwordNueva" className="text-sm font-medium text-marca-carbon">
          Nueva contraseña
        </label>
        <input
          id="passwordNueva"
          type="password"
          required
          minLength={8}
          value={passwordNueva}
          onChange={(evento) => setPasswordNueva(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label
          htmlFor="confirmarPasswordNueva"
          className="text-sm font-medium text-marca-carbon"
        >
          Confirmar nueva contraseña
        </label>
        <input
          id="confirmarPasswordNueva"
          type="password"
          required
          minLength={8}
          value={confirmarPassword}
          onChange={(evento) => setConfirmarPassword(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {actualizado ? (
        <p className="text-sm text-emerald-700">Contraseña actualizada.</p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-marca-dorado px-5 py-2.5 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Actualizando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
