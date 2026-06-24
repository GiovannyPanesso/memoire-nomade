"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const ENLACES_NAV = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/tours", etiqueta: "Tours" },
  { href: "/contacto", etiqueta: "Contacto" },
];

interface PropiedadesHeader {
  nombreNegocio: string;
  logoUrl: string | null;
}

export function Header({ nombreNegocio, logoUrl }: PropiedadesHeader) {
  const pathname = usePathname();
  const [conScroll, setConScroll] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esHome = pathname === "/";
  const fondoOscuro = !esHome || conScroll || menuAbierto;

  useEffect(() => {
    function manejarScroll() {
      setConScroll(window.scrollY > 40);
    }
    manejarScroll();
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        fondoOscuro ? "bg-marca-carbon shadow-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={nombreNegocio}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : null}
          <span className="font-serif text-lg text-white">{nombreNegocio}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {ENLACES_NAV.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="text-sm font-medium text-white/90 transition hover:text-marca-dorado"
            >
              {enlace.etiqueta}
            </Link>
          ))}
          <Link
            href="/tours"
            className="rounded-md bg-marca-dorado px-5 py-2 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
          >
            Reservar ahora
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuAbierto((anterior) => !anterior)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          className="text-white md:hidden"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto ? (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-marca-carbon px-6 py-4 md:hidden">
          {ENLACES_NAV.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
            >
              {enlace.etiqueta}
            </Link>
          ))}
          <Link
            href="/tours"
            onClick={() => setMenuAbierto(false)}
            className="mt-2 rounded-md bg-marca-dorado px-4 py-2.5 text-center text-sm font-medium text-marca-carbon"
          >
            Reservar ahora
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
