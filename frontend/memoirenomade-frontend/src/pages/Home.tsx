import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { tourService } from "@/services/tourService";
import { TourSummary } from "@/types/tour.types";
import TourCard from "@/components/TourCard";
import WhyChooseUs from "@/components/WhyChooseUs";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1920&q=80";

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const tours = await tourService.getFeaturedTours();
        setFeaturedTours(tours);
      } catch (error) {
        console.error("Error cargando tours destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-yellow-400 font-serif text-lg mb-3 tracking-widest uppercase">
            París como nunca la has vivido
          </p>
          <h1 className="text-white font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            Mémoire Nomade
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-10 leading-relaxed">
            Tours exclusivos en París con guías nativos de habla hispana. Grupos
            reducidos, experiencias únicas.
          </p>
          <Link
            to="/tours"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Visualizar los tours disponibles
          </Link>
        </div>

        {/* Indicador scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* ── Por qué elegirnos ─────────────────────────────────────── */}
      <WhyChooseUs />

      {/* ── Tours destacados ──────────────────────────────────────── */}
      {!loading && featuredTours.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-app">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a2e] mb-4">
                Tours destacados
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Nuestras experiencias más populares, elegidas por cientos de
                viajeros de habla hispana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/tours"
                className="inline-block border-2 border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-semibold px-8 py-3 rounded-full transition-all duration-300"
              >
                Ver todos los tours disponibles
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
