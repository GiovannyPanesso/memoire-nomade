"use server";

import { EstadoReserva } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import { exigirSesionAdmin } from "@/lib/auth/exigir-sesion-admin";
import { fechaIsoAFechaUTC, fechaUTCAFechaISO } from "@/lib/disponibilidad/fechas";
import type {
  DiaCalendarioAdmin,
  DetalleDiaDisponibilidad,
  EstadoDiaDisponibilidad,
} from "@/types";

const ESTADOS_QUE_CUENTAN: EstadoReserva[] = [
  EstadoReserva.PENDIENTE,
  EstadoReserva.CONFIRMADA,
  EstadoReserva.COMPLETADA,
];

export async function obtenerCalendarioMes(
  tourId: string,
  anio: number,
  mes: number
): Promise<DiaCalendarioAdmin[]> {
  await exigirSesionAdmin();

  const inicioMes = new Date(Date.UTC(anio, mes - 1, 1));
  const finMes = new Date(Date.UTC(anio, mes, 0));

  const [bloqueos, reservas] = await Promise.all([
    prisma.disponibilidadTour.findMany({
      where: {
        tourId,
        disponible: false,
        fecha: { gte: inicioMes, lte: finMes },
      },
      select: { fecha: true },
    }),
    prisma.reserva.groupBy({
      by: ["fecha"],
      where: {
        tourId,
        fecha: { gte: inicioMes, lte: finMes },
        estado: { in: ESTADOS_QUE_CUENTAN },
      },
      _count: { _all: true },
    }),
  ]);

  const fechasBloqueadas = new Set(
    bloqueos.map((bloqueo) => fechaUTCAFechaISO(bloqueo.fecha))
  );
  const conteoReservas = new Map(
    reservas.map((reserva) => [
      fechaUTCAFechaISO(reserva.fecha),
      reserva._count._all,
    ])
  );

  const hoyIso = fechaUTCAFechaISO(new Date());
  const totalDias = finMes.getUTCDate();
  const dias: DiaCalendarioAdmin[] = [];

  for (let dia = 1; dia <= totalDias; dia++) {
    const fechaIso = fechaUTCAFechaISO(new Date(Date.UTC(anio, mes - 1, dia)));
    const numeroReservas = conteoReservas.get(fechaIso) ?? 0;

    let estado: EstadoDiaDisponibilidad;
    if (fechaIso < hoyIso) {
      estado = "PASADO";
    } else if (fechasBloqueadas.has(fechaIso)) {
      estado = "BLOQUEADO";
    } else if (numeroReservas > 0) {
      estado = "CON_RESERVAS";
    } else {
      estado = "DISPONIBLE";
    }

    dias.push({ fecha: fechaIso, estado, numeroReservas });
  }

  return dias;
}

export async function obtenerDetalleDia(
  tourId: string,
  fechaIso: string
): Promise<DetalleDiaDisponibilidad> {
  await exigirSesionAdmin();

  const fecha = fechaIsoAFechaUTC(fechaIso);

  const [bloqueo, reservas] = await Promise.all([
    prisma.disponibilidadTour.findUnique({
      where: { tourId_fecha: { tourId, fecha } },
      select: { disponible: true, motivo: true },
    }),
    prisma.reserva.findMany({
      where: { tourId, fecha, estado: { in: ESTADOS_QUE_CUENTAN } },
      orderBy: { creadoEn: "asc" },
      select: { id: true, nombreCliente: true, estado: true, creadoEn: true },
    }),
  ]);

  return {
    fecha: fechaIso,
    bloqueado: bloqueo ? !bloqueo.disponible : false,
    motivo: bloqueo?.motivo ?? null,
    reservas,
  };
}

export async function obtenerDisponibilidadPublica(
  tourId: string,
  mesInicio: string,
  mesFin: string
): Promise<string[]> {
  const [anioInicio, numeroMesInicio] = mesInicio.split("-").map(Number);
  const [anioFin, numeroMesFin] = mesFin.split("-").map(Number);

  const inicioRango = new Date(Date.UTC(anioInicio, numeroMesInicio - 1, 1));
  const finRango = new Date(Date.UTC(anioFin, numeroMesFin, 0));

  const bloqueos = await prisma.disponibilidadTour.findMany({
    where: {
      tourId,
      disponible: false,
      fecha: { gte: inicioRango, lte: finRango },
    },
    select: { fecha: true },
  });

  return bloqueos.map((bloqueo) => fechaUTCAFechaISO(bloqueo.fecha));
}

export async function verificarFechaDisponible(
  tourId: string,
  fechaIso: string
): Promise<boolean> {
  const fecha = fechaIsoAFechaUTC(fechaIso);

  const bloqueo = await prisma.disponibilidadTour.findUnique({
    where: { tourId_fecha: { tourId, fecha } },
    select: { disponible: true },
  });

  return bloqueo ? bloqueo.disponible : true;
}
