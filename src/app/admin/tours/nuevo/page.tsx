import { FormularioTour } from "@/components/admin/formulario-tour";
import { crearTour } from "@/lib/tours/acciones";
import { obtenerConfigCloudinaryCliente } from "@/lib/cloudinary/config";

export default function PaginaNuevoTour() {
  const cloudinary = obtenerConfigCloudinaryCliente();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-marca-carbon">Nuevo tour</h1>
        <p className="mt-1 text-sm text-marca-gris">
          Crea un nuevo tour para el catálogo
        </p>
      </div>

      <div className="rounded-lg border border-marca-dorado/20 bg-white p-6">
        <FormularioTour
          alGuardar={crearTour}
          textoBoton="Crear tour"
          cloudinary={cloudinary}
        />
      </div>
    </div>
  );
}
