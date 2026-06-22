import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { EstadoReserva } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import type { ResumenDashboard, ReservaReciente } from "@/types";

const ESTADOS_NO_CANCELADOS = [
  EstadoReserva.PENDIENTE,
  EstadoReserva.CONFIRMADA,
  EstadoReserva.COMPLETADA,
];

const ESTADOS_CON_PAGO_CONFIRMADO = [
  EstadoReserva.CONFIRMADA,
  EstadoReserva.COMPLETADA,
];

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const ahora = new Date();

  const [reservasHoy, reservasSemana, agregadoMes, totalReservas] =
    await Promise.all([
      prisma.reserva.count({
        where: {
          fecha: { gte: startOfDay(ahora), lte: endOfDay(ahora) },
          estado: { in: ESTADOS_NO_CANCELADOS },
        },
      }),
      prisma.reserva.count({
        where: {
          fecha: {
            gte: startOfWeek(ahora, { weekStartsOn: 1 }),
            lte: endOfWeek(ahora, { weekStartsOn: 1 }),
          },
          estado: { in: ESTADOS_NO_CANCELADOS },
        },
      }),
      prisma.reserva.aggregate({
        _sum: { precioTotal: true },
        where: {
          creadoEn: { gte: startOfMonth(ahora), lte: endOfMonth(ahora) },
          estado: { in: ESTADOS_CON_PAGO_CONFIRMADO },
        },
      }),
      prisma.reserva.count(),
    ]);

  return {
    reservasHoy,
    reservasSemana,
    ingresosMes: agregadoMes._sum.precioTotal?.toNumber() ?? 0,
    totalReservas,
  };
}

export async function obtenerReservasRecientes(
  limite: number
): Promise<ReservaReciente[]> {
  const reservas = await prisma.reserva.findMany({
    take: limite,
    orderBy: { creadoEn: "desc" },
    include: { tour: { select: { nombre: true } } },
  });

  return reservas.map((reserva) => ({
    id: reserva.id,
    numero: reserva.numero,
    nombreCliente: reserva.nombreCliente,
    tourNombre: reserva.tour.nombre,
    fecha: reserva.fecha,
    precioTotal: reserva.precioTotal.toNumber(),
    estado: reserva.estado,
  }));
}
