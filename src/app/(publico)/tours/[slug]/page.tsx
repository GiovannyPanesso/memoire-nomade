import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Check, X } from "lucide-react";
import { obtenerTourPorSlug } from "@/lib/tours/consultas";
import { CalculadoraPrecio } from "@/components/tours/calculadora-precio";

const LONGITUD_DESCRIPCION_META = 160;

interface PropiedadesPaginaTour {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropiedadesPaginaTour): Promise<Metadata> {
  const { slug } = await params;
  const tour = await obtenerTourPorSlug(slug);

  if (!tour) {
    return { title: "Tour no encontrado | Mémoire Nomade" };
  }

  return {
    title: `${tour.nombre} | Mémoire Nomade`,
    description: tour.descripcion.slice(0, LONGITUD_DESCRIPCION_META),
  };
}

export default async function PaginaDetalleTour({
  params,
}: PropiedadesPaginaTour) {
  const { slug } = await params;
  const tour = await obtenerTourPorSlug(slug);

  if (!tour) {
    notFound();
  }

  return (
    <div>
      <section className="relative flex h-[60vh] min-h-[420px] items-end">
        <Image
          src={tour.imagenUrl}
          alt={tour.nombre}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-10 text-white">
          <h1 className="font-serif text-3xl sm:text-5xl">{tour.nombre}</h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            {tour.duracion}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section>
          <h2 className="font-serif text-2xl text-marca-carbon">Descripción</h2>
          <p className="mt-3 text-marca-gris">{tour.descripcion}</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-marca-carbon">
            Lugares que visitarás
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {tour.lugaresInteres.map((lugar) => (
              <li key={lugar} className="flex items-center gap-2 text-marca-carbon">
                <MapPin className="h-4 w-4 shrink-0 text-marca-dorado" />
                {lugar}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl text-marca-carbon">
              ¿Qué incluye?
            </h2>
            <ul className="mt-3 space-y-2">
              {tour.incluye.map((item) => (
                <li key={item} className="flex items-start gap-2 text-marca-carbon">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl text-marca-carbon">
              ¿Qué no incluye?
            </h2>
            <ul className="mt-3 space-y-2">
              {tour.noIncluye.map((item) => (
                <li key={item} className="flex items-start gap-2 text-marca-gris">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-2xl text-marca-carbon">
            Selecciona tu experiencia
          </h2>
          <div className="mt-6">
            <CalculadoraPrecio
              tourId={tour.id}
              slug={tour.slug}
              tarifas={tour.tarifas}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
