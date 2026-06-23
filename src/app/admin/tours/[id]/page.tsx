import { notFound } from "next/navigation";
import { obtenerTourPorId } from "@/lib/tours/consultas";
import {
  actualizarTour,
  eliminarTarifa,
  crearTarifaRango,
  crearTarifaNino,
  crearTarifaOpcional,
} from "@/lib/tours/acciones";
import { FormularioTour } from "@/components/admin/formulario-tour";
import { BotonEliminarTour } from "@/components/admin/boton-eliminar-tour";
import { obtenerConfigCloudinaryCliente } from "@/lib/cloudinary/config";
import type { TarifaTourDetalle } from "@/types";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function describirTarifa(tarifa: TarifaTourDetalle): string {
  if (tarifa.esOpcional) {
    return tarifa.nombreOpcional ?? "Opcional";
  }
  if (tarifa.esNino) {
    return `Niños (hasta ${tarifa.edadMaxNino} años)`;
  }
  if (tarifa.minPersonas !== null && tarifa.maxPersonas !== null) {
    return `Adultos (${tarifa.minPersonas}-${tarifa.maxPersonas} personas)`;
  }
  return "Tarifa";
}

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

interface PropiedadesPaginaDetalleTour {
  params: Promise<{ id: string }>;
}

export default async function PaginaDetalleTour({
  params,
}: PropiedadesPaginaDetalleTour) {
  const { id } = await params;
  const tour = await obtenerTourPorId(id);

  if (!tour) {
    notFound();
  }

  const cloudinary = obtenerConfigCloudinaryCliente();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-marca-carbon">
            {tour.nombre}
          </h1>
          <p className="mt-1 text-sm text-marca-gris">/tours/{tour.slug}</p>
        </div>
        <BotonEliminarTour id={tour.id} nombre={tour.nombre} redirigirALista />
      </div>

      <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
        <h2 className="font-serif text-lg text-marca-carbon">
          Datos del tour
        </h2>
        <div className="mt-4">
          <FormularioTour
            tourInicial={{
              nombre: tour.nombre,
              slug: tour.slug,
              descripcion: tour.descripcion,
              duracion: tour.duracion,
              lugaresInteres: tour.lugaresInteres,
              incluye: tour.incluye,
              noIncluye: tour.noIncluye,
              imagenUrl: tour.imagenUrl,
              activo: tour.activo,
            }}
            alGuardar={actualizarTour.bind(null, tour.id)}
            textoBoton="Guardar cambios"
            cloudinary={cloudinary}
          />
        </div>
      </section>

      <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
        <h2 className="font-serif text-lg text-marca-carbon">Tarifas</h2>

        {tour.tarifas.length > 0 ? (
          <ul className="mt-4 divide-y divide-marca-dorado/10">
            {tour.tarifas.map((tarifa) => (
              <li
                key={tarifa.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-marca-carbon">
                  {describirTarifa(tarifa)}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-marca-carbon">
                    {formatoMoneda.format(tarifa.precio)}
                  </span>
                  <form action={eliminarTarifa.bind(null, tarifa.id, tour.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-marca-gris">
            Este tour todavía no tiene tarifas.
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <form
            action={crearTarifaRango.bind(null, tour.id)}
            className="space-y-2 rounded-md border border-marca-dorado/10 p-4"
          >
            <p className="text-sm font-medium text-marca-carbon">
              Tarifa por rango de adultos
            </p>
            <input
              name="minPersonas"
              type="number"
              min="1"
              required
              placeholder="Mín. personas"
              className={ESTILOS_INPUT}
            />
            <input
              name="maxPersonas"
              type="number"
              min="1"
              required
              placeholder="Máx. personas"
              className={ESTILOS_INPUT}
            />
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Precio por persona (€)"
              className={ESTILOS_INPUT}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-marca-dorado px-3 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
            >
              Añadir tarifa
            </button>
          </form>

          <form
            action={crearTarifaNino.bind(null, tour.id)}
            className="space-y-2 rounded-md border border-marca-dorado/10 p-4"
          >
            <p className="text-sm font-medium text-marca-carbon">
              Tarifa de niños
            </p>
            <input
              name="edadMaxNino"
              type="number"
              min="0"
              required
              placeholder="Edad máxima"
              className={ESTILOS_INPUT}
            />
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Precio por niño (€)"
              className={ESTILOS_INPUT}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-marca-dorado px-3 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
            >
              Añadir tarifa
            </button>
          </form>

          <form
            action={crearTarifaOpcional.bind(null, tour.id)}
            className="space-y-2 rounded-md border border-marca-dorado/10 p-4"
          >
            <p className="text-sm font-medium text-marca-carbon">Opcional</p>
            <input
              name="nombreOpcional"
              type="text"
              required
              placeholder="Ej: Crucero por el Sena"
              className={ESTILOS_INPUT}
            />
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Precio por persona (€)"
              className={ESTILOS_INPUT}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-marca-dorado px-3 py-2 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro"
            >
              Añadir opcional
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
