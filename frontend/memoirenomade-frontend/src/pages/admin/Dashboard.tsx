import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  Calendar,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import api from "@/services/api";
import { formatPrice, formatDate, formatTime } from "@/utils/formatters";

interface DashboardData {
  metrics: {
    bookingsToday: number;
    revenueThisMonth: number;
    activeTours: number;
    unreadMessages: number;
  };
  recentBookings: {
    id: number;
    confirmationCode: string;
    customerName: string;
    totalAmount: number;
    status: string;
    bookingDate: string;
    tours: string[];
  }[];
  upcomingSessions: {
    id: number;
    tourName: string;
    date: string;
    time: string;
    availableSpots: number;
    includesSeineCruise: boolean;
  }[];
}

const statusColors: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  Confirmada: "bg-green-100 text-green-700",
  Cancelada: "bg-red-100 text-red-700",
  Completada: "bg-blue-100 text-blue-700",
  Reembolsada: "bg-purple-100 text-purple-700",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: response } = await api.get("/admin/dashboard");
        setData(response);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
          Panel de Control
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenido de vuelta. Aquí tienes un resumen del negocio.
        </p>
      </div>

      {/* ── Métricas ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={<BookOpen size={22} className="text-yellow-600" />}
          label="Reservas hoy"
          value={data.metrics.bookingsToday.toString()}
          bg="bg-yellow-50"
        />
        <MetricCard
          icon={<TrendingUp size={22} className="text-green-600" />}
          label="Ingresos del mes"
          value={formatPrice(data.metrics.revenueThisMonth)}
          bg="bg-green-50"
        />
        <MetricCard
          icon={<Map size={22} className="text-blue-600" />}
          label="Tours activos"
          value={data.metrics.activeTours.toString()}
          bg="bg-blue-50"
        />
        <MetricCard
          icon={<MessageSquare size={22} className="text-purple-600" />}
          label="Mensajes sin leer"
          value={data.metrics.unreadMessages.toString()}
          bg="bg-purple-50"
          alert={data.metrics.unreadMessages > 0}
        />
      </div>

      {/* ── Accesos rápidos ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            to: "/admin/tours",
            icon: <Map size={20} />,
            label: "Gestionar Tours",
          },
          {
            to: "/admin/sessions",
            icon: <Calendar size={20} />,
            label: "Gestionar Sesiones",
          },
          {
            to: "/admin/bookings",
            icon: <BookOpen size={20} />,
            label: "Ver Reservas",
          },
          {
            to: "/admin/messages",
            icon: <MessageSquare size={20} />,
            label: "Ver Mensajes",
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="text-yellow-600">{item.icon}</div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a1a2e]">
              {item.label}
            </span>
            <ArrowRight
              size={14}
              className="text-gray-300 group-hover:text-yellow-500 ml-auto transition-colors"
            />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Últimas reservas ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-serif font-bold text-[#1a1a2e] text-lg">
              Últimas reservas
            </h2>
            <Link
              to="/admin/bookings"
              className="text-yellow-600 text-sm hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {data.recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No hay reservas aún.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/admin/bookings`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-yellow-600 font-semibold">
                      {booking.confirmationCode}
                    </p>
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">
                      {booking.customerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(booking.bookingDate.split("T")[0])}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-[#1a1a2e] text-sm">
                      {formatPrice(booking.totalAmount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        statusColors[booking.status] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Próximas sesiones ────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-serif font-bold text-[#1a1a2e] text-lg">
              Próximas sesiones
            </h2>
            <Link
              to="/admin/sessions"
              className="text-yellow-600 text-sm hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {data.upcomingSessions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No hay sesiones próximas en los próximos 7 días.
            </p>
          ) : (
            <div className="space-y-3">
              {data.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">
                      {session.tourName}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={11} />
                      {formatDate(session.date)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {formatTime(session.time)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users size={14} />
                      <span>{session.availableSpots} plazas</span>
                    </div>
                    {session.includesSeineCruise && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Crucero
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente auxiliar ───────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  alert?: boolean;
}

function MetricCard({ icon, label, value, bg, alert }: MetricCardProps) {
  return (
    <div className={`${bg} rounded-2xl p-5 relative overflow-hidden`}>
      {alert && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      )}
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
