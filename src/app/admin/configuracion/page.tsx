import { obtenerConfiguracion, obtenerAdmins } from "@/lib/configuracion/consultas";
import { PestanasConfiguracion } from "@/components/admin/pestanas-configuracion";

export default async function PaginaConfiguracion() {
  const [configuracion, admins] = await Promise.all([
    obtenerConfiguracion(),
    obtenerAdmins(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-marca-carbon">Configuración</h1>
        <p className="mt-1 text-sm text-marca-gris">
          Administra los datos del negocio y los accesos al panel
        </p>
      </div>

      <PestanasConfiguracion configuracionInicial={configuracion} admins={admins} />
    </div>
  );
}
