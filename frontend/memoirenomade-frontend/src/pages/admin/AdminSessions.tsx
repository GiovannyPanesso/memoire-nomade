import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { sessionService } from "@/services/sessionService";
import { tourService } from "@/services/tourService";
import { Session } from "@/types/session.types";
import { TourSummary } from "@/types/tour.types";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";
import AdminSessionForm from "./AdminSessionForm";

const statusColors: Record<string, string> = {
  Activa: "bg-green-100 text-green-700",
  Completada: "bg-blue-100 text-blue-700",
  Cancelada: "bg-red-100 text-red-700",
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterTourId, setFilterTourId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, toursData] = await Promise.all([
        sessionService.getAllSessions(),
        tourService.getAllTours(),
      ]);
      setSessions(sessionsData);
      setTours(toursData);
    } catch {
      setActionError("No se pudieron cargar las sesiones.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await sessionService.getAllSessions(
        filterTourId ? parseInt(filterTourId) : undefined,
        filterStatus || undefined,
      );
      setSessions(data);
    } catch {
      setActionError("No se pudieron cargar las sesiones.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta sesión?")) return;
    try {
      setActionError(null);
      await sessionService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo eliminar la sesión.",
      );
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setActionError(null);
      await sessionService.updateStatus(id, newStatus);
      await fetchSessions();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo cambiar el estado.",
      );
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSession(null);
    fetchSessions();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (showForm || editingSession) {
    return (
      <AdminSessionForm
        session={editingSession}
        tours={tours}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingSession(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            Gestión de Sesiones
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {sessions.length} sesiones en total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          Crear sesión
        </button>
      </div>

      {/* Error */}
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

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3">
        <select
          value={filterTourId}
          onChange={(e) => setFilterTourId(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
        >
          <option value="">Todos los tours</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Activa">Activa</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <button
          onClick={fetchSessions}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-semibold rounded-xl transition-all text-sm"
        >
          <RefreshCw size={14} />
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-4">No hay sesiones que mostrar.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-yellow-500 text-[#1a1a2e] font-bold px-6 py-3 rounded-xl"
          >
            <Plus size={18} />
            Crear primera sesión
          </button>
        </div>
      ) : (
        <>
          {/* Vista móvil — tarjetas */}
          <div className="md:hidden space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-sm p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#1a1a2e] text-sm">
                      {session.tourName}
                    </p>
                    {session.includesSeineCruise && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Crucero Sena
                      </span>
                    )}
                  </div>
                  <select
                    value={session.status}
                    onChange={(e) =>
                      handleStatusChange(session.id, e.target.value)
                    }
                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer outline-none ${
                      statusColors[session.status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <option value="Activa">Activa</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-gray-700">{formatDate(session.date)}</p>
                    <p className="text-xs text-gray-400">
                      {formatTime(session.time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">
                      {session.availableSpots}
                    </p>
                    <p className="text-xs text-gray-400">plazas</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {session.pricings.slice(0, 2).map((p) => (
                    <p key={p.id} className="text-xs text-gray-500">
                      {p.label}:{" "}
                      <span className="font-semibold">
                        {formatPrice(p.price)}
                      </span>
                    </p>
                  ))}
                  {session.pricings.length > 2 && (
                    <p className="text-xs text-gray-400">
                      +{session.pricings.length - 2} más
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setEditingSession(session)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Tour
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Fecha y hora
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Plazas
                    </th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Tarifas
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#1a1a2e] text-sm">
                          {session.tourName}
                        </p>
                        {session.includesSeineCruise && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            Crucero Sena
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">
                          {formatDate(session.date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(session.time)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {session.availableSpots}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={session.status}
                          onChange={(e) =>
                            handleStatusChange(session.id, e.target.value)
                          }
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer outline-none ${
                            statusColors[session.status] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <option value="Activa">Activa</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          {session.pricings.slice(0, 2).map((p) => (
                            <p key={p.id} className="text-xs text-gray-500">
                              {p.label}:{" "}
                              <span className="font-semibold">
                                {formatPrice(p.price)}
                              </span>
                            </p>
                          ))}
                          {session.pricings.length > 2 && (
                            <p className="text-xs text-gray-400">
                              +{session.pricings.length - 2} más
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSession(session)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
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
