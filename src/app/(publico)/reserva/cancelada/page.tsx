import Link from "next/link";
import type { Metadata } from "next";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Pago no completado | Mémoire Nomade",
};

interface PropiedadesPaginaCancelada {
  searchParams: Promise<{ tour?: string }>;
}

export default async function PaginaReservaCancelada({
  searchParams,
}: PropiedadesPaginaCancelada) {
  const { tour } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6 pb-16 pt-24 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-9 w-9 text-red-500" />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-marca-carbon">
          El pago no se completó
        </h1>
        <p className="mt-3 text-marca-gris">
          No te preocupes, no se ha realizado ningún cargo. Puedes intentarlo de
          nuevo cuando quieras.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {tour ? (
            <Link
              href={`/tours/${tour}`}
              className="rounded-md bg-marca-dorado px-6 py-3 text-sm font-medium text-marca-carbon transition hover:bg-marca-dorado-oscuro hover:text-white"
            >
              Intentar de nuevo
            </Link>
          ) : null}
          <Link
            href="/tours"
            className="rounded-md border border-marca-dorado px-6 py-3 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
          >
            Ver otros tours
          </Link>
        </div>
      </div>
    </div>
  );
}
