import { Prisma, EstadoReserva } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import {
  construirOpcionalesEmail,
  parsearOpcionalesSeleccionados,
} from "@/lib/reservas/opcionales";
import { construirDatosEmailReserva } from "@/lib/reservas/datos-email";
import { obtenerConfiguracion } from "@/lib/configuracion/consultas";
import type {
  FiltrosReservas,
  ReservaListado,
  ResultadoListadoReservas,
  ReservaDetalle,
  TourParaFiltro,
  ConfirmacionReservaPublica,
  DatosEmailReserva,
} from "@/types";

export const TAMANIO_PAGINA = 20;

const ESTADOS_VALIDOS = new Set<string>(Object.values(EstadoReserva));

export function parsearFiltrosReservas(
  parametros: Record<string, string | string[] | undefined>
): FiltrosReservas {
  const estadoCrudo = parametros.estado;
  const estado =
    typeof estadoCrudo === "string" && ESTADOS_VALIDOS.has(estadoCrudo)
      ? (estadoCrudo as EstadoReserva)
      : undefined;

  const tourId =
    typeof parametros.tourId === "string" && parametros.tourId.length > 0
      ? parametros.tourId
      : undefined;

  const busqueda =
    typeof parametros.busqueda === "string" && parametros.busqueda.trim().length > 0
      ? parametros.busqueda.trim()
      : undefined;

  const paginaCruda = Number(parametros.pagina);
  const pagina =
    Number.isInteger(paginaCruda) && paginaCruda > 0 ? paginaCruda : 1;

  return { estado, tourId, busqueda, pagina };
}

export function construirQueryStringFiltros(filtros: FiltrosReservas): string {
  const parametros = new URLSearchParams();
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.tourId) parametros.set("tourId", filtros.tourId);
  if (filtros.busqueda) parametros.set("busqueda", filtros.busqueda);
  return parametros.toString();
}

function construirFiltroWhere(filtros: FiltrosReservas): Prisma.ReservaWhereInput {
  return {
    ...(filtros.estado ? { estado: filtros.estado } : {}),
    ...(filtros.tourId ? { tourId: filtros.tourId } : {}),
    ...(filtros.busqueda
      ? {
          OR: [
            {
              nombreCliente: {
                contains: filtros.busqueda,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              emailCliente: {
                contains: filtros.busqueda,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
  };
}

function mapearReservaListado(reserva: {
  id: string;
  numero: string;
  nombreCliente: string;
  emailCliente: string;
  fecha: Date;
  numeroAdultos: number;
  numeroNinos: number;
  precioTotal: Prisma.Decimal;
  estado: EstadoReserva;
  creadoEn: Date;
  tour: { nombre: string };
}): ReservaListado {
  return {
    id: reserva.id,
    numero: reserva.numero,
    nombreCliente: reserva.nombreCliente,
    emailCliente: reserva.emailCliente,
    tourNombre: reserva.tour.nombre,
    fecha: reserva.fecha,
    numeroPersonas: reserva.numeroAdultos + reserva.numeroNinos,
    precioTotal: reserva.precioTotal.toNumber(),
    estado: reserva.estado,
    creadoEn: reserva.creadoEn,
  };
}

export async function obtenerReservas(
  filtros: FiltrosReservas
): Promise<ResultadoListadoReservas> {
  const where = construirFiltroWhere(filtros);
  const skip = (filtros.pagina - 1) * TAMANIO_PAGINA;

  const [reservas, total] = await Promise.all([
    prisma.reserva.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      skip,
      take: TAMANIO_PAGINA,
      include: { tour: { select: { nombre: true } } },
    }),
    prisma.reserva.count({ where }),
  ]);

  return {
    reservas: reservas.map(mapearReservaListado),
    total,
    totalPaginas: Math.max(1, Math.ceil(total / TAMANIO_PAGINA)),
    paginaActual: filtros.pagina,
  };
}

export async function obtenerReservasParaExportar(
  filtros: FiltrosReservas
): Promise<ReservaListado[]> {
  const where = construirFiltroWhere(filtros);

  const reservas = await prisma.reserva.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    include: { tour: { select: { nombre: true } } },
  });

  return reservas.map(mapearReservaListado);
}

export async function obtenerReservaPorId(
  id: string
): Promise<ReservaDetalle | null> {
  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: { tour: { select: { id: true, nombre: true, duracion: true } } },
  });

  if (!reserva) {
    return null;
  }

  const opcionalesSeleccionados = parsearOpcionalesSeleccionados(
    reserva.opcionalesSeleccionados
  );

  const tarifasOpcionales =
    opcionalesSeleccionados.length > 0
      ? await prisma.tarifaTour.findMany({
          where: { id: { in: opcionalesSeleccionados.map((o) => o.tarifaId) } },
        })
      : [];

  const tarifasOpcionalesPorId = new Map(
    tarifasOpcionales.map((tarifa) => [tarifa.id, tarifa])
  );

  return {
    id: reserva.id,
    numero: reserva.numero,
    tour: reserva.tour,
    fecha: reserva.fecha,
    nombreCliente: reserva.nombreCliente,
    emailCliente: reserva.emailCliente,
    telefonoCliente: reserva.telefonoCliente,
    paisCliente: reserva.paisCliente,
    numeroAdultos: reserva.numeroAdultos,
    numeroNinos: reserva.numeroNinos,
    edadesNinos: reserva.edadesNinos,
    opcionales: opcionalesSeleccionados.flatMap((opcional) => {
      const tarifa = tarifasOpcionalesPorId.get(opcional.tarifaId);
      if (!tarifa) {
        return [];
      }
      return [
        {
          id: tarifa.id,
          nombre: tarifa.nombreOpcional ?? "Opcional",
          precio: tarifa.precio.toNumber(),
          cantidad: opcional.cantidad,
        },
      ];
    }),
    precioTotal: reserva.precioTotal.toNumber(),
    estado: reserva.estado,
    stripePaymentIntentId: reserva.stripePaymentIntentId,
    mensajeCliente: reserva.mensajeCliente,
    notas: reserva.notas,
    creadoEn: reserva.creadoEn,
    actualizadoEn: reserva.actualizadoEn,
  };
}

// Pública: solo se llama con el id del PaymentIntent que el propio cliente
// recibió de Stripe tras pagar, para mostrarle el número de su reserva.
export async function obtenerConfirmacionReservaPorPaymentIntent(
  paymentIntentId: string
): Promise<ConfirmacionReservaPublica | null> {
  const reserva = await prisma.reserva.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { numero: true, fecha: true, tour: { select: { nombre: true } } },
  });

  if (!reserva) {
    return null;
  }

  return {
    numero: reserva.numero,
    tourNombre: reserva.tour.nombre,
    fecha: reserva.fecha,
  };
}

// Pública por el mismo motivo que la función anterior: permite generar el
// PDF descargable de la reserva desde la pantalla de confirmación.
export async function obtenerDatosEmailReservaPorPaymentIntent(
  paymentIntentId: string
): Promise<DatosEmailReserva | null> {
  const reserva = await prisma.reserva.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { tour: true },
  });

  if (!reserva) {
    return null;
  }

  const opcionalesSeleccionados = parsearOpcionalesSeleccionados(
    reserva.opcionalesSeleccionados
  );

  const tarifasOpcionales =
    opcionalesSeleccionados.length > 0
      ? await prisma.tarifaTour.findMany({
          where: { id: { in: opcionalesSeleccionados.map((o) => o.tarifaId) } },
        })
      : [];

  const opcionales = construirOpcionalesEmail(
    tarifasOpcionales.map((tarifa) => ({
      id: tarifa.id,
      nombreOpcional: tarifa.nombreOpcional,
      precio: tarifa.precio.toNumber(),
    })),
    opcionalesSeleccionados
  );

  const configuracion = await obtenerConfiguracion();

  return construirDatosEmailReserva(reserva, reserva.tour, opcionales, configuracion);
}

export async function obtenerToursParaFiltro(): Promise<TourParaFiltro[]> {
  return prisma.tour.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
}
