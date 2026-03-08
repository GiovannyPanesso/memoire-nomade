import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Calendar,
  BookOpen,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

const navItems = [
  {
    to: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
    label: "Panel de Control",
  },
  { to: "/admin/tours", icon: <Map size={20} />, label: "Tours" },
  { to: "/admin/sessions", icon: <Calendar size={20} />, label: "Sesiones" },
  { to: "/admin/bookings", icon: <BookOpen size={20} />, label: "Reservas" },
  {
    to: "/admin/messages",
    icon: <MessageSquare size={20} />,
    label: "Mensajes",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      navigate("/admin/login");
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
      isActive
        ? "bg-yellow-500 text-[#1a1a2e]"
        : "text-gray-400 hover:bg-white/10 hover:text-white"
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-white/10">
        <h1 className="text-yellow-400 font-serif text-lg font-bold">
          Mémoire Nomade
        </h1>
        <p className="text-gray-500 text-xs mt-1">Panel de Administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {/* Usuarios solo para superadmin */}
        {user?.isSuperAdmin && (
          <NavLink
            to="/admin/users"
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            Administradores
          </NavLink>
        )}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3">
          <p className="text-white text-sm font-medium truncate">
            {user?.name}
          </p>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          {user?.isSuperAdmin && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">
              Superadmin
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm w-full"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ── Sidebar escritorio ────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-[#1a1a2e] flex-col fixed h-full">
        <SidebarContent />
      </aside>

      {/* ── Sidebar móvil ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-64 bg-[#1a1a2e] flex flex-col">
            <SidebarContent />
          </aside>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* ── Contenido principal ───────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Topbar móvil */}
        <header className="md:hidden bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
          <h1 className="text-yellow-400 font-serif font-bold">
            Mémoire Nomade
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
