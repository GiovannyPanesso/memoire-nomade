import Link from "next/link";
import Image from "next/image";
import type { TourPublico } from "@/types";

const LONGITUD_DESCRIPCION_CORTA = 150;

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface PropiedadesTarjetaTour {
  tour: TourPublico;
  variante?: "compacta" | "grande";
}

export function TarjetaTour({ tour, variante = "compacta" }: PropiedadesTarjetaTour) {
  const descripcionCorta =
    variante === "grande"
      ? tour.descripcion.length > LONGITUD_DESCRIPCION_CORTA
        ? `${tour.descripcion.slice(0, LONGITUD_DESCRIPCION_CORTA).trim()}…`
        : tour.descripcion
      : null;

  return (
    <div className="group overflow-hidden rounded-lg border border-marca-dorado/20 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <Image
          src={tour.imagenUrl}
          alt={tour.nombre}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg text-marca-carbon">{tour.nombre}</h3>
        <p className="mt-1 text-sm text-marca-gris">{tour.duracion}</p>
        {descripcionCorta ? (
          <p className="mt-2 text-sm text-marca-gris">{descripcionCorta}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-marca-carbon">
            Desde{" "}
            <span className="font-semibold text-marca-dorado-oscuro">
              {formatoMoneda.format(tour.precioDesde)}
            </span>
          </p>
          <Link
            href={`/tours/${tour.slug}`}
            className="shrink-0 rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
          >
            {variante === "grande" ? "Ver detalles" : "Ver tour"}
          </Link>
        </div>
      </div>
    </div>
  );
}
