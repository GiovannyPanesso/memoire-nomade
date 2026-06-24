import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

interface PropiedadesContenidoConfirmacion {
  numero: string;
  tourNombre: string;
  fecha: Date;
  paymentIntentId: string;
}

export function ContenidoConfirmacion({
  numero,
  tourNombre,
  fecha,
  paymentIntentId,
}: PropiedadesContenidoConfirmacion) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-marca-dorado/10">
        <CheckCircle2 className="h-9 w-9 text-marca-dorado-oscuro" />
      </div>
      <h1 className="mt-6 font-serif text-3xl text-marca-carbon">¡Reserva confirmada!</h1>
      <p className="mt-3 text-marca-gris">
        {tourNombre} · {formatoFecha.format(fecha)}
      </p>
      <div className="mx-auto mt-6 inline-block rounded-lg border border-marca-dorado/20 bg-marca-crema px-8 py-4">
        <p className="text-xs uppercase tracking-wide text-marca-gris">
          Número de reserva
        </p>
        <p className="mt-1 font-serif text-3xl text-marca-dorado-oscuro">{numero}</p>
      </div>
      <p className="mt-6 text-sm text-marca-gris">
        Recibirás un email de confirmación con todos los detalles de tu tour.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={`/api/reservas/pdf?paymentIntentId=${encodeURIComponent(paymentIntentId)}`}
          className="inline-flex items-center gap-2 rounded-md border border-marca-dorado px-6 py-3 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
        >
          <Download className="h-4 w-4" />
          Descargar PDF de la reserva
        </a>
        <Link
          href="/tours"
          className="inline-block rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
        >
          Volver a los tours
        </Link>
      </div>
    </div>
  );
}
