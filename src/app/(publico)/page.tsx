import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Languages,
  Users,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";
import { obtenerImagenesSitio } from "@/lib/configuracion/consultas";
import { obtenerToursPublicos } from "@/lib/tours/consultas";
import { TarjetaTour } from "@/components/tours/tarjeta-tour";

const MAXIMO_TOURS_DESTACADOS = 6;

export const metadata: Metadata = {
  title: "Mémoire Nomade — Tours guiados en español por París",
  description:
    "Descubre París con tours exclusivos en español, guías apasionados y grupos pequeños. Reserva tu experiencia parisina inolvidable.",
};

const PROPUESTA_VALOR = [
  {
    Icono: Languages,
    titulo: "Guías en español",
    descripcion:
      "Vive París sin barreras idiomáticas, con guías nativos apasionados",
  },
  {
    Icono: Users,
    titulo: "Grupos pequeños",
    descripcion:
      "Experiencias íntimas y personalizadas, nunca masificadas",
  },
  {
    Icono: Sparkles,
    titulo: "Experiencia auténtica",
    descripcion: "Descubre el París que los turistas no ven",
  },
];

const PUNTOS_CLAVE = [
  "Guías locales certificados y apasionados por la historia de París",
  "Grupos reducidos para una experiencia cercana y personalizada",
  "Itinerarios pensados para descubrir rincones auténticos de la ciudad",
  "Atención en español de principio a fin, sin sorpresas",
];

const TESTIMONIOS = [
  {
    nombre: "Camila",
    iniciales: "C",
    pais: "Colombia",
    texto:
      "Jamás olvidaré subir al Sacré-Cœur al atardecer con nuestra guía. Nos contó historias de los artistas que vivieron en Montmartre que no encontrarás en ninguna guía de viaje.",
    tour: "Montmartre y el Espíritu Bohemio",
  },
  {
    nombre: "Javier",
    iniciales: "J",
    pais: "España",
    texto:
      "Era nuestra primera vez en París y temíamos perdernos entre tanto monumento. El guía nos llevó de la Torre Eiffel al Arco del Triunfo sin prisas, explicando cada detalle como si fuéramos parte de la familia.",
    tour: "Lo Esencial de París",
  },
  {
    nombre: "Valentina",
    iniciales: "V",
    pais: "Argentina",
    texto:
      "La Galería de los Espejos nos dejó sin palabras, pero lo que más recuerdo es cómo nuestra guía hacía que los jardines de Versalles cobraran vida con cada anécdota de la corte real.",
    tour: "Versalles: Palacio y Jardines",
  },
];

interface PropiedadesFondoImagen {
  src: string | null;
  alt: string;
  prioridad?: boolean;
}

function FondoImagen({ src, alt, prioridad }: PropiedadesFondoImagen) {
  if (!src) {
    return <div className="absolute inset-0 bg-marca-carbon" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={prioridad}
      className="object-cover"
      sizes="100vw"
    />
  );
}

interface PropiedadesBannerSeparador {
  imagen: string | null;
  frase: string;
}

function BannerSeparador({ imagen, frase }: PropiedadesBannerSeparador) {
  return (
    <section className="relative flex h-72 items-center justify-center overflow-hidden sm:h-96">
      <FondoImagen src={imagen} alt="París" />
      <div className="absolute inset-0 bg-black/55" />
      <p className="relative z-10 max-w-2xl px-6 text-center font-serif text-2xl italic text-white sm:text-3xl">
        “{frase}”
      </p>
    </section>
  );
}

export default async function PaginaInicio() {
  const [imagenesSitio, toursDestacados] = await Promise.all([
    obtenerImagenesSitio(),
    obtenerToursPublicos(MAXIMO_TOURS_DESTACADOS),
  ]);

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative flex h-screen min-h-[560px] items-center justify-center overflow-hidden">
        <FondoImagen
          src={imagenesSitio.imagenCabecera}
          alt="París desde las alturas"
          prioridad
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-3xl animate-in fade-in px-6 text-center text-white duration-1000">
          <h1 className="font-serif text-4xl sm:text-6xl">
            Descubre París como nunca antes
          </h1>
          <p className="mt-5 text-base text-white/90 sm:text-lg">
            Tours exclusivos en español con guías apasionados por la Ciudad
            de la Luz
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/tours"
              className="rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
            >
              Ver nuestros tours
            </Link>
            <a
              href="#nosotros"
              className="rounded-md border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-marca-carbon"
            >
              ¿Quiénes somos?
            </a>
          </div>
        </div>
      </section>

      {/* 2. Propuesta de valor */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
          {PROPUESTA_VALOR.map(({ Icono, titulo, descripcion }) => (
            <div key={titulo} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-marca-dorado/10">
                <Icono className="h-7 w-7 text-marca-dorado-oscuro" />
              </div>
              <h3 className="mt-4 font-serif text-lg text-marca-carbon">
                {titulo}
              </h3>
              <p className="mt-2 text-sm text-marca-gris">{descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Tours destacados */}
      <section className="bg-marca-crema px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-3xl text-marca-carbon">
            Nuestros tours
          </h2>
          {toursDestacados.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {toursDestacados.map((tour) => (
                <TarjetaTour key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-marca-gris">
              Muy pronto publicaremos nuestros tours.
            </p>
          )}
        </div>
      </section>

      {/* 3.5 Banner separador */}
      <BannerSeparador
        imagen={imagenesSitio.imagenSeccion2}
        frase="París no es solo una ciudad, es un sentimiento que se vive una vez y se recuerda para siempre."
      />

      {/* 4. ¿Por qué elegirnos? */}
      <section id="nosotros" className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="relative h-72 overflow-hidden rounded-lg sm:h-96">
            <FondoImagen
              src={imagenesSitio.imagenSeccion1}
              alt="Calles de París"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl text-marca-carbon">
              Una experiencia que recordarás toda la vida
            </h2>
            <p className="mt-4 text-marca-gris">
              En Mémoire Nomade creemos que viajar es mucho más que visitar
              monumentos: es vivir historias. Por eso diseñamos cada tour
              para que descubras París a través de los ojos de quienes la
              conocen y la aman, con la calidez del idioma español y el
              ritmo de un grupo pequeño.
            </p>
            <ul className="mt-6 space-y-3">
              {PUNTOS_CLAVE.map((punto) => (
                <li key={punto} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-marca-dorado" />
                  <span className="text-sm text-marca-carbon">{punto}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/tours"
              className="mt-8 inline-block rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
            >
              Conoce nuestros tours
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Galería de París */}
      <section className="bg-marca-crema px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-3xl text-marca-carbon">
            París te espera
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              imagenesSitio.imagenGaleria1,
              imagenesSitio.imagenGaleria2,
              imagenesSitio.imagenGaleria3,
            ].map((imagen, indice) => (
              <div
                key={indice}
                className="group relative h-64 overflow-hidden rounded-lg"
              >
                {imagen ? (
                  <Image
                    src={imagen}
                    alt={`Galería de París ${indice + 1}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                ) : (
                  <div className="h-full w-full bg-marca-carbon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5 Banner separador */}
      <BannerSeparador
        imagen={imagenesSitio.imagenSeccion3}
        frase="Cada calle empedrada esconde una historia. Déjanos mostrarte la suya."
      />

      {/* 5.7 Momentos reales (galería de clientes) */}
      <section className="bg-marca-crema px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-3xl text-marca-carbon">
            Momentos que recordarán siempre
          </h2>
          <p className="mt-3 text-center text-sm text-marca-gris">
            Cada tour es una historia única
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              imagenesSitio.imagenCliente1,
              imagenesSitio.imagenCliente2,
              imagenesSitio.imagenCliente3,
              imagenesSitio.imagenCliente4,
              imagenesSitio.imagenCliente5,
              imagenesSitio.imagenCliente6,
            ].map((imagen, indice) =>
              imagen ? (
                <div
                  key={indice}
                  className="group relative h-64 overflow-hidden rounded-lg"
                >
                  <Image
                    src={imagen}
                    alt="Cliente de Mémoire Nomade viviendo un tour por París"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/40" />
                </div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* 6. Testimonios */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-3xl text-marca-carbon">
            Experiencias que hablan por sí solas
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIOS.map((testimonio) => (
              <div
                key={testimonio.nombre}
                className="rounded-lg border border-marca-dorado/20 bg-marca-crema p-6"
              >
                <div className="flex gap-0.5 text-marca-dorado">
                  {Array.from({ length: 5 }).map((_, indice) => (
                    <Star key={indice} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-marca-carbon">
                  “{testimonio.texto}”
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marca-dorado text-sm font-medium text-white">
                    {testimonio.iniciales}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-marca-carbon">
                      {testimonio.nombre}
                    </p>
                    <p className="text-xs text-marca-gris">
                      {testimonio.pais} · {testimonio.tour}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA final */}
      <section className="bg-marca-dorado px-6 py-16 text-center">
        <h2 className="font-serif text-3xl text-marca-carbon sm:text-4xl">
          Tu aventura parisina comienza aquí
        </h2>
        <p className="mt-3 text-marca-carbon/80">
          Cupos limitados por grupo reducido. Reserva con anticipación.
        </p>
        <Link
          href="/tours"
          className="mt-8 inline-block rounded-md bg-marca-carbon px-8 py-3 text-sm font-medium text-white transition hover:bg-marca-carbon/90"
        >
          Reservar mi tour
        </Link>
      </section>
    </div>
  );
}
