import { useEffect, useState } from "react";
import { tourService } from "@/services/tourService";
import { TourSummary } from "@/types/tour.types";
import TourCard from "@/components/TourCard";
import { Search } from "lucide-react";

export default function Tours() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await tourService.getActiveTours();
        setTours(data);
      } catch {
        setError("No se pudieron cargar los tours. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de página */}
      <div className="bg-[#1a1a2e] py-16">
        <div className="container-app text-center">
          <h1 className="text-white font-serif text-4xl md:text-5xl font-bold mb-4">
            Nuestros Tours
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Descubre París con guías nativos de habla hispana. Cada tour es una
            experiencia única e irrepetible.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="container-app py-16">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No hay tours disponibles en este momento.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Vuelve pronto, estamos preparando nuevas experiencias.
            </p>
          </div>
        )}

        {!loading && !error && tours.length > 0 && (
          <>
            <p className="text-gray-500 mb-8">
              {tours.length}{" "}
              {tours.length === 1 ? "tour disponible" : "tours disponibles"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
