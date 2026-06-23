"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearAdmin } from "@/lib/configuracion/acciones";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

export function FormularioNuevoAdmin() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState(false);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCreado(false);

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    iniciarTransicion(async () => {
      try {
        await crearAdmin({ nombre, email, password, confirmarPassword });
        setNombre("");
        setEmail("");
        setPassword("");
        setConfirmarPassword("");
        setCreado(true);
        router.refresh();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo crear el administrador."
        );
      }
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div>
        <label htmlFor="nombreNuevoAdmin" className="text-sm font-medium text-marca-carbon">
          Nombre
        </label>
        <input
          id="nombreNuevoAdmin"
          type="text"
          required
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="emailNuevoAdmin" className="text-sm font-medium text-marca-carbon">
          Email
        </label>
        <input
          id="emailNuevoAdmin"
          type="email"
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="passwordNuevoAdmin" className="text-sm font-medium text-marca-carbon">
          Contraseña
        </label>
        <input
          id="passwordNuevoAdmin"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label
          htmlFor="confirmarPasswordNuevoAdmin"
          className="text-sm font-medium text-marca-carbon"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmarPasswordNuevoAdmin"
          type="password"
          required
          minLength={8}
          value={confirmarPassword}
          onChange={(evento) => setConfirmarPassword(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {creado ? (
        <p className="text-sm text-emerald-700">Administrador creado.</p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-marca-dorado px-5 py-2.5 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Creando..." : "Crear administrador"}
      </button>
    </form>
  );
}
