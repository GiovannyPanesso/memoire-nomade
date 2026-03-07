import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300 mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Quiénes somos */}
          <div>
            <h3 className="text-yellow-400 font-serif text-lg font-semibold mb-4">
              Mémoire Nomade
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Tours turísticos en París con guías nativos de habla hispana.
              Descubre la Ciudad de la Luz de una forma única, íntima y
              memorable.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
              <MapPin size={16} className="text-yellow-400 shrink-0" />
              <span>París, Francia</span>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-yellow-400 font-serif text-lg font-semibold mb-4">
              Información
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/tours"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Nuestros tours
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Política de cancelaciones
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-yellow-400 font-serif text-lg font-semibold mb-4">
              Contacto directo
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail size={16} className="text-yellow-400 shrink-0" />
                <a
                  href="mailto:info@memoirenomade.com"
                  className="hover:text-yellow-400 transition-colors"
                >
                  info@memoirenomade.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone size={16} className="text-yellow-400 shrink-0" />
                <a
                  href="tel:+33600000000"
                  className="hover:text-yellow-400 transition-colors"
                >
                  +33 6 00 00 00 00
                </a>
              </li>
            </ul>

            {/* Redes sociales */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>

              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Mémoire Nomade. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
