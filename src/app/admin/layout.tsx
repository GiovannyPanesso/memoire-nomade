import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";
import { BotonCerrarSesion } from "@/components/admin/boton-cerrar-sesion";

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const cabeceras = await headers();
  const pathname = cabeceras.get("x-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const sesion = await getServerSession(opcionesAuth);

  if (!sesion) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-marca-crema">
      <header className="flex items-center justify-between border-b border-marca-dorado/30 bg-white px-6 py-4">
        <span className="font-serif text-lg text-marca-carbon">
          Mémoire Nomade — Administración
        </span>
        <div className="flex items-center gap-4 text-sm text-marca-gris">
          <span>{sesion.user?.name}</span>
          <BotonCerrarSesion />
        </div>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
