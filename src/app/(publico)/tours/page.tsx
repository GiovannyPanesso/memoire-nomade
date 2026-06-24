import type { Metadata } from "next";
import { obtenerToursPublicos } from "@/lib/tours/consultas";
import { TarjetaTour } from "@/components/tours/tarjeta-tour";

export const metadata: Metadata = {
  title: "Nuestros Tours en París | Mémoire Nomade",
  description:
    "Explora todos nuestros tours guiados en español por París: monumentos icónicos, Montmartre, Versalles y más.",
};

export default async function PaginaTours() {
  const tours = await obtenerToursPublicos();

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-center font-serif text-4xl text-marca-carbon">
          Nuestros Tours en París
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-marca-gris">
          Cada tour está diseñado para que vivas París con guías en español,
          grupos reducidos y la calidez de una experiencia auténtica.
        </p>

        {tours.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TarjetaTour key={tour.id} tour={tour} variante="grande" />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-marca-gris">
            Muy pronto publicaremos nuestros tours.
          </p>
        )}
      </div>
    </div>
  );
}
