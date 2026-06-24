import Link from "next/link";
import { Instagram, MessageCircle, Mail, Phone } from "lucide-react";

interface PropiedadesFooter {
  nombreNegocio: string;
  emailContacto: string;
  telefonoContacto: string;
}

function construirEnlaceWhatsApp(telefono: string): string {
  const numeroLimpio = telefono.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${numeroLimpio}`;
}

export function Footer({
  nombreNegocio,
  emailContacto,
  telefonoContacto,
}: PropiedadesFooter) {
  return (
    <footer className="bg-marca-carbon text-white/80">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl text-white">{nombreNegocio}</p>
          <p className="mt-3 text-sm text-white/70">
            Tours exclusivos en español por París, con guías apasionados y
            experiencias auténticas en la Ciudad de la Luz.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-white">Enlaces</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/tours" className="transition hover:text-marca-dorado">
                Tours
              </Link>
            </li>
            <li>
              <Link href="/politicas" className="transition hover:text-marca-dorado">
                Políticas
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="transition hover:text-marca-dorado">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-white">Contacto</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-marca-dorado" />
              {emailContacto}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-marca-dorado" />
              {telefonoContacto}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-white">Síguenos</p>
          <div className="mt-3 flex gap-3">
            <a
              href="https://instagram.com/memoirenomade"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-white/20 p-2 transition hover:border-marca-dorado hover:text-marca-dorado"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={construirEnlaceWhatsApp(telefonoContacto)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="rounded-full border border-white/20 p-2 transition hover:border-marca-dorado hover:text-marca-dorado"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/60">
        © 2025 Mémoire Nomade. Todos los derechos reservados.
      </div>
    </footer>
  );
}
