"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCargando(false);

    if (!resultado || resultado.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-marca-crema px-4">
      <div className="w-full max-w-md rounded-lg border border-marca-dorado/30 bg-white p-10 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-marca-carbon">
            Mémoire Nomade
          </h1>
          <p className="mt-2 text-sm text-marca-gris">
            Acceso al panel de administración
          </p>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-marca-carbon"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              className="w-full rounded-md border border-marca-gris/30 px-3 py-2 text-marca-carbon outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-marca-carbon"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              className="w-full rounded-md border border-marca-gris/30 px-3 py-2 text-marca-carbon outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-marca-dorado px-4 py-2.5 font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
