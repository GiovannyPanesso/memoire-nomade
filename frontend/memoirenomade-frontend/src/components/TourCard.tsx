import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { TourSummary } from "@/types/tour.types";

interface TourCardProps {
  tour: TourSummary;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800";

export default function TourCard({ tour }: TourCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* Imagen */}
      <div className="relative overflow-hidden h-52">
        <img
          src={tour.mainImageUrl || FALLBACK_IMAGE}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge plazas */}
        <div className="absolute bottom-3 left-3">
          {tour.availableSpots > 0 ? (
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Users size={12} />
              {tour.availableSpots} plazas disponibles
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Sin plazas disponibles
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-[#1a1a2e] font-serif font-bold text-xl mb-2 line-clamp-1">
          {tour.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {tour.description}
        </p>

        <Link
          to={`/tours/${tour.id}`}
          className="inline-flex items-center gap-2 text-yellow-600 font-semibold text-sm hover:gap-3 transition-all"
        >
          Ver tour
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
