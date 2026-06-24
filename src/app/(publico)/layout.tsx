import {
  obtenerConfiguracion,
  obtenerImagenesSitio,
} from "@/lib/configuracion/consultas";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  const [configuracion, imagenesSitio] = await Promise.all([
    obtenerConfiguracion(),
    obtenerImagenesSitio(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        nombreNegocio={configuracion.nombreNegocio}
        logoUrl={imagenesSitio.logoUrl}
      />
      <main className="flex-1">{children}</main>
      <Footer
        nombreNegocio={configuracion.nombreNegocio}
        emailContacto={configuracion.emailContacto}
        telefonoContacto={configuracion.telefonoContacto}
      />
    </div>
  );
}
