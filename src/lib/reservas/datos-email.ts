import type { Prisma } from "@prisma/client";
import type { ConfiguracionNegocio, DatosEmailReserva, OpcionalEmailReserva } from "@/types";

interface ReservaParaDatosEmail {
  id: string;
  numero: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  paisCliente: string;
  fecha: Date;
  numeroAdultos: number;
  numeroNinos: number;
  precioTotal: Prisma.Decimal;
  mensajeCliente: string | null;
  stripePaymentIntentId: string | null;
}

interface TourParaDatosEmail {
  nombre: string;
  duracion: string;
  incluye: string[];
}

export function construirDatosEmailReserva(
  reserva: ReservaParaDatosEmail,
  tour: TourParaDatosEmail,
  opcionales: OpcionalEmailReserva[],
  configuracion: ConfiguracionNegocio
): DatosEmailReserva {
  return {
    reservaId: reserva.id,
    numero: reserva.numero,
    nombreCliente: reserva.nombreCliente,
    emailCliente: reserva.emailCliente,
    telefonoCliente: reserva.telefonoCliente,
    paisCliente: reserva.paisCliente,
    tourNombre: tour.nombre,
    tourDuracion: tour.duracion,
    tourIncluye: tour.incluye,
    fecha: reserva.fecha,
    numeroAdultos: reserva.numeroAdultos,
    numeroNinos: reserva.numeroNinos,
    opcionales,
    precioTotal: reserva.precioTotal.toNumber(),
    mensajeCliente: reserva.mensajeCliente,
    stripePaymentIntentId: reserva.stripePaymentIntentId,
    emailContacto: configuracion.emailContacto,
    telefonoContacto: configuracion.telefonoContacto,
  };
}
