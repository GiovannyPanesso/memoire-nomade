"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  CalendarRange,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { BotonCerrarSesion } from "@/components/admin/boton-cerrar-sesion";

interface ElementoNav {
  href: string;
  etiqueta: string;
  Icono: LucideIcon;
}

const ELEMENTOS_NAV: ElementoNav[] = [
  { href: "/admin", etiqueta: "Dashboard", Icono: LayoutDashboard },
  { href: "/admin/reservas", etiqueta: "Reservas", Icono: CalendarCheck },
  { href: "/admin/tours", etiqueta: "Tours", Icono: MapPin },
  { href: "/admin/disponibilidad", etiqueta: "Disponibilidad", Icono: CalendarRange },
  { href: "/admin/configuracion", etiqueta: "Configuración", Icono: Settings },
];

function esEnlaceActivo(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface PropiedadesSidebar {
  nombreAdmin: string;
}

export function Sidebar({ nombreAdmin }: PropiedadesSidebar) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-marca-dorado/20 bg-marca-carbon px-4 py-3 lg:hidden">
        <span className="font-serif text-lg text-white">Mémoire Nomade</span>
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          className="text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {menuAbierto ? (
        <div
          role="presentation"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-marca-carbon transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="font-serif text-xl text-white">Mémoire Nomade</p>
            <p className="text-xs font-medium text-marca-dorado">Administración</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="text-white/70 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {ELEMENTOS_NAV.map(({ href, etiqueta, Icono }) => {
            const activo = esEnlaceActivo(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  activo
                    ? "bg-marca-dorado text-marca-carbon"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icono className="h-5 w-5" />
                {etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">{nombreAdmin}</p>
          <div className="mt-3">
            <BotonCerrarSesion />
          </div>
        </div>
      </aside>
    </>
  );
}
