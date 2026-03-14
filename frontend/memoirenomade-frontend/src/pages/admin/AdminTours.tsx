import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { tourService } from "@/services/tourService";
import { TourSummary } from "@/types/tour.types";

export default function AdminTours() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const data = await tourService.getAllTours();
      setTours(data);
    } catch {
      setError("No se pudieron cargar los tours.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(`¿Eliminar el tour "${name}"? Esta acción no se puede deshacer.`)
    )
      return;

    try {
      setActionError(null);
      await tourService.deleteTour(id);
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo eliminar el tour.",
      );
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      setActionError(null);
      await tourService.toggleFeatured(id);
      await fetchTours();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ??
          "No se pudo cambiar el estado de destacado.",
      );
    }
  };

  const handleToggleActive = async (tour: TourSummary) => {
    try {
      setActionError(null);
      await tourService.updateTour(tour.id, {
        ...tour,
        isActive: !tour.isActive,
      });
      await fetchTours();
    } catch {
      setActionError("No se pudo cambiar el estado del tour.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            Gestión de Tours
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {tours.length} tours en total ·{" "}
            {tours.filter((t) => t.isFeatured).length}/3 destacados
          </p>
        </div>
        <Link
          to="/admin/tours/new"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          Crear tour
        </Link>
      </div>

      {/* Error de acción */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {tours.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-4">No hay tours creados aún.</p>
          <Link
            to="/admin/tours/new"
            className="inline-flex items-center gap-2 bg-yellow-500 text-[#1a1a2e] font-bold px-6 py-3 rounded-xl"
          >
            <Plus size={18} />
            Crear primer tour
          </Link>
        </div>
      ) : (
        <>
          {/* Vista móvil — tarjetas */}
          <div className="md:hidden space-y-3">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl shadow-sm p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={
                        tour.mainImageUrl ||
                        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100"
                      }
                      alt={tour.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1a2e] text-sm">
                      {tour.name}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {tour.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleActive(tour)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                      tour.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tour.isActive ? (
                      <>
                        <Eye size={12} /> Activo
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Inactivo
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(tour.id)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                      tour.isFeatured
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {tour.isFeatured ? (
                      <>
                        <Star size={12} /> Destacado
                      </>
                    ) : (
                      <>
                        <StarOff size={12} /> No destacado
                      </>
                    )}
                  </button>

                  <span className="inline-flex items-center text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-full">
                    {tour.sessionCount} sesiones
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/admin/tours/${tour.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(tour.id, tour.name)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    disabled={tour.sessionCount > 0}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista escritorio — tabla */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tour
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Destacado
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sesiones
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img
                              src={
                                tour.mainImageUrl ||
                                "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100"
                              }
                              alt={tour.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1a2e] text-sm">
                              {tour.name}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                              {tour.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(tour)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                            tour.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {tour.isActive ? (
                            <>
                              <Eye size={12} /> Activo
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(tour.id)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                            tour.isFeatured
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {tour.isFeatured ? (
                            <>
                              <Star size={12} /> Destacado
                            </>
                          ) : (
                            <>
                              <StarOff size={12} /> No destacado
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {tour.sessionCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/tours/${tour.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(tour.id, tour.name)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                            disabled={tour.sessionCount > 0}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
