import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";
import { Sidebar } from "@/components/admin/sidebar";

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
    <div className="flex min-h-screen flex-col bg-marca-crema lg:flex-row">
      <Sidebar nombreAdmin={sesion.user?.name ?? ""} />
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
