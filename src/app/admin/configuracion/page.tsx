import {
  obtenerConfiguracion,
  obtenerAdmins,
  obtenerImagenesSitio,
} from "@/lib/configuracion/consultas";
import { obtenerConfigCloudinaryCliente } from "@/lib/cloudinary/config";
import { PestanasConfiguracion } from "@/components/admin/pestanas-configuracion";

export default async function PaginaConfiguracion() {
  const [configuracion, admins, imagenesSitio] = await Promise.all([
    obtenerConfiguracion(),
    obtenerAdmins(),
    obtenerImagenesSitio(),
  ]);
  const cloudinary = obtenerConfigCloudinaryCliente();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-marca-carbon">Configuración</h1>
        <p className="mt-1 text-sm text-marca-gris">
          Administra los datos del negocio y los accesos al panel
        </p>
      </div>

      <PestanasConfiguracion
        configuracionInicial={configuracion}
        admins={admins}
        imagenesIniciales={imagenesSitio}
        cloudinary={cloudinary}
      />
    </div>
  );
}
