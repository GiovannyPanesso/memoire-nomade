import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-yellow-500 font-semibold"
      : "text-gray-200 hover:text-yellow-400 transition-colors";

  return (
    <nav className="bg-[#1a1a2e] sticky top-0 z-50 shadow-lg">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-yellow-400 font-serif text-xl font-bold tracking-wide">
              Mémoire Nomade
            </span>
          </Link>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/tours" className={isActive("/tours")}>
              Tours
            </Link>
            <Link to="/contact" className={isActive("/contact")}>
              Contacto
            </Link>
          </div>

          {/* Carrito + menú móvil */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative text-gray-200 hover:text-yellow-400 transition-colors"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-[#1a1a2e] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Botón menú móvil */}
            <button
              className="md:hidden text-gray-200 hover:text-yellow-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4 flex flex-col gap-4">
            <Link
              to="/tours"
              className={`${isActive("/tours")} px-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link
              to="/contact"
              className={`${isActive("/contact")} px-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
