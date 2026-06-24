import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { calcularPoliticaCancelacion } from "@/lib/reservas/politicas-cancelacion";
import type { ResultadoCalculoPrecio } from "@/lib/tours/calculadora-precio";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

interface OpcionalSeleccionadoResumen {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface PropiedadesResumenReserva {
  tourNombre: string;
  tourImagenUrl: string;
  tourDuracion: string;
  fecha: Date;
  numeroAdultos: number;
  numeroNinos: number;
  opcionales: OpcionalSeleccionadoResumen[];
  resultadoPrecio: ResultadoCalculoPrecio;
}

export function ResumenReserva({
  tourNombre,
  tourImagenUrl,
  tourDuracion,
  fecha,
  numeroAdultos,
  numeroNinos,
  opcionales,
  resultadoPrecio,
}: PropiedadesResumenReserva) {
  const politica = calcularPoliticaCancelacion(fecha);
  const precioUnitarioAdulto =
    numeroAdultos > 0 ? resultadoPrecio.precioAdultos / numeroAdultos : 0;
  const precioUnitarioNino = numeroNinos > 0 ? resultadoPrecio.precioNinos / numeroNinos : 0;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-marca-dorado/20 bg-white">
        <div className="relative h-48 w-full">
          <Image
            src={tourImagenUrl}
            alt={tourNombre}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="p-5">
          <h2 className="font-serif text-xl text-marca-carbon">{tourNombre}</h2>
          <p className="mt-1 text-sm text-marca-gris">
            {tourDuracion} · {formatoFecha.format(fecha)}
          </p>

          <div className="mt-5 space-y-2 border-t border-marca-dorado/10 pt-4 text-sm text-marca-carbon">
            <div className="flex justify-between gap-3">
              <span>
                {numeroAdultos} adulto{numeroAdultos !== 1 ? "s" : ""} ×{" "}
                {formatoMoneda.format(precioUnitarioAdulto)}
              </span>
              <span className="shrink-0">
                {formatoMoneda.format(resultadoPrecio.precioAdultos)}
              </span>
            </div>
            {numeroNinos > 0 ? (
              <div className="flex justify-between gap-3">
                <span>
                  {numeroNinos} niño{numeroNinos !== 1 ? "s" : ""} ×{" "}
                  {formatoMoneda.format(precioUnitarioNino)}
                </span>
                <span className="shrink-0">
                  {formatoMoneda.format(resultadoPrecio.precioNinos)}
                </span>
              </div>
            ) : null}
            {opcionales.map((opcional) => (
              <div key={opcional.id} className="flex justify-between gap-3">
                <span>
                  {opcional.nombre} ({opcional.cantidad} pers.)
                </span>
                <span className="shrink-0">
                  {formatoMoneda.format(opcional.precio * opcional.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-marca-dorado/20 pt-4">
            <span className="font-serif text-lg text-marca-carbon">Total</span>
            <span className="font-serif text-3xl text-marca-dorado-oscuro">
              {formatoMoneda.format(resultadoPrecio.precioTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-marca-dorado/20 bg-marca-crema p-5 text-sm text-marca-carbon">
        <p className="font-medium">Política de cancelación</p>
        <ul className="mt-2 space-y-1 text-marca-gris">
          <li>Más de 30 días de antelación: 70% de reembolso</li>
          <li>Entre 15 y 30 días de antelación: 50% de reembolso</li>
          <li>Menos de 15 días de antelación o no show: sin reembolso</li>
        </ul>
        <p className="mt-3 text-xs text-marca-gris">
          Para tu fecha de tour: {politica.descripcion} ({politica.porcentajeReembolso}%
          de reembolso si cancelas hoy)
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-marca-gris">
        <ShieldCheck className="h-5 w-5 shrink-0 text-marca-dorado-oscuro" />
        Pago 100% seguro procesado por Stripe
      </div>
    </div>
  );
}
