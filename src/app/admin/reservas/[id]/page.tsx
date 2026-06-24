import { notFound } from "next/navigation";
import { obtenerReservaPorId } from "@/lib/reservas/consultas";
import { calcularPoliticaCancelacion } from "@/lib/reservas/politicas-cancelacion";
import { BadgeEstado } from "@/components/admin/badge-estado";
import { AccionesEstadoReserva } from "@/components/admin/acciones-estado-reserva";
import { NotasInternasReserva } from "@/components/admin/notas-internas-reserva";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const formatoFechaHora = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface PropiedadesPaginaDetalleReserva {
  params: Promise<{ id: string }>;
}

export default async function PaginaDetalleReserva({
  params,
}: PropiedadesPaginaDetalleReserva) {
  const { id } = await params;
  const reserva = await obtenerReservaPorId(id);

  if (!reserva) {
    notFound();
  }

  const politica = calcularPoliticaCancelacion(reserva.fecha);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-marca-carbon">
            Reserva {reserva.numero}
          </h1>
          <p className="mt-1 text-sm text-marca-gris">
            Creada el {formatoFechaHora.format(reserva.creadoEn)}
          </p>
        </div>
        <BadgeEstado estado={reserva.estado} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-lg text-marca-carbon">Cliente</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-marca-gris">Nombre</dt>
              <dd className="text-marca-carbon">{reserva.nombreCliente}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Email</dt>
              <dd className="text-marca-carbon">{reserva.emailCliente}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Teléfono</dt>
              <dd className="text-marca-carbon">{reserva.telefonoCliente}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">País</dt>
              <dd className="text-marca-carbon">{reserva.paisCliente}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-lg text-marca-carbon">Tour</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-marca-gris">Tour</dt>
              <dd className="text-marca-carbon">{reserva.tour.nombre}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Duración</dt>
              <dd className="text-marca-carbon">{reserva.tour.duracion}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Fecha</dt>
              <dd className="text-marca-carbon">
                {formatoFecha.format(reserva.fecha)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-lg text-marca-carbon">Grupo</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-marca-gris">Adultos</dt>
              <dd className="text-marca-carbon">{reserva.numeroAdultos}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Niños</dt>
              <dd className="text-marca-carbon">{reserva.numeroNinos}</dd>
            </div>
            {reserva.edadesNinos.length > 0 ? (
              <div className="flex justify-between">
                <dt className="text-marca-gris">Edades de los niños</dt>
                <dd className="text-marca-carbon">
                  {reserva.edadesNinos.join(", ")}
                </dd>
              </div>
            ) : null}
          </dl>

          {reserva.opcionales.length > 0 ? (
            <div className="mt-4 border-t border-marca-dorado/10 pt-4">
              <p className="text-sm font-medium text-marca-carbon">
                Opcionales seleccionados
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {reserva.opcionales.map((opcional) => (
                  <li
                    key={opcional.id}
                    className="flex justify-between text-marca-gris"
                  >
                    <span>
                      {opcional.nombre} ({opcional.cantidad}{" "}
                      {opcional.cantidad === 1 ? "persona" : "personas"})
                    </span>
                    <span className="text-marca-carbon">
                      {formatoMoneda.format(opcional.precio * opcional.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-lg text-marca-carbon">Pago</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-marca-gris">Precio total</dt>
              <dd className="font-medium text-marca-carbon">
                {formatoMoneda.format(reserva.precioTotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-marca-gris">Referencia Stripe</dt>
              <dd className="text-marca-carbon">
                {reserva.stripePaymentIntentId ?? "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-md bg-marca-crema p-3 text-sm text-marca-carbon">
            <p className="font-medium">Política de cancelación aplicable hoy</p>
            <p className="mt-1 text-marca-gris">
              {politica.descripcion}: reembolso del{" "}
              {politica.porcentajeReembolso}%
            </p>
          </div>
        </section>
      </div>

      {reserva.mensajeCliente ? (
        <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
          <h2 className="font-serif text-lg text-marca-carbon">
            Mensaje del cliente
          </h2>
          <p className="mt-3 text-sm text-marca-carbon">
            {reserva.mensajeCliente}
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
        <h2 className="font-serif text-lg text-marca-carbon">
          Notas internas
        </h2>
        <div className="mt-3">
          <NotasInternasReserva
            id={reserva.id}
            notasIniciales={reserva.notas ?? ""}
          />
        </div>
      </section>

      <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
        <h2 className="font-serif text-lg text-marca-carbon">
          Cambiar estado
        </h2>
        <div className="mt-3">
          <AccionesEstadoReserva id={reserva.id} estadoActual={reserva.estado} />
        </div>
      </section>
    </div>
  );
}
