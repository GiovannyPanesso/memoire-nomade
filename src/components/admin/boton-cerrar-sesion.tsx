"use client";

import { signOut } from "next-auth/react";

export function BotonCerrarSesion() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-md border border-marca-dorado px-3 py-1.5 text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}
