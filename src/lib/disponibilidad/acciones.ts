"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/cliente";
import { exigirSesionAdmin } from "@/lib/auth/exigir-sesion-admin";
import { fechaIsoAFechaUTC, fechaUTCAFechaISO } from "@/lib/disponibilidad/fechas";
import { analizarZod } from "@/lib/validacion/analizar-zod";

const LIMITE_DIAS_RANGO = 366;

const esquemaFechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

function obtenerFechaHoyIsoUTC(): string {
  return fechaUTCAFechaISO(new Date());
}

function generarRangoFechasISO(inicioIso: string, finIso: string): string[] {
  const fechas: string[] = [];
  let actual = fechaIsoAFechaUTC(inicioIso);
  const fin = fechaIsoAFechaUTC(finIso);

  while (actual <= fin) {
    fechas.push(fechaUTCAFechaISO(actual));
    actual = new Date(actual.getTime() + 24 * 60 * 60 * 1000);
  }

  return fechas;
}

const esquemaBloquearFecha = z.object({
  tourId: z.string().min(1),
  fecha: esquemaFechaIso,
  motivo: z.string().max(200).optional(),
});

export async function bloquearFecha(
  tourId: string,
  fecha: string,
  motivo?: string
): Promise<void> {
  await exigirSesionAdmin();
  const datos = analizarZod(esquemaBloquearFecha, { tourId, fecha, motivo });

  if (datos.fecha < obtenerFechaHoyIsoUTC()) {
    throw new Error("No se puede bloquear una fecha pasada.");
  }

  const fechaUTC = fechaIsoAFechaUTC(datos.fecha);
  await prisma.disponibilidadTour.upsert({
    where: { tourId_fecha: { tourId: datos.tourId, fecha: fechaUTC } },
    create: {
      tourId: datos.tourId,
      fecha: fechaUTC,
      disponible: false,
      motivo: datos.motivo ?? null,
    },
    update: { disponible: false, motivo: datos.motivo ?? null },
  });

  revalidatePath("/admin/disponibilidad");
}

const esquemaDesbloquearFecha = z.object({
  tourId: z.string().min(1),
  fecha: esquemaFechaIso,
});

export async function desbloquearFecha(
  tourId: string,
  fecha: string
): Promise<void> {
  await exigirSesionAdmin();
  const datos = analizarZod(esquemaDesbloquearFecha, { tourId, fecha });

  await prisma.disponibilidadTour.deleteMany({
    where: { tourId: datos.tourId, fecha: fechaIsoAFechaUTC(datos.fecha) },
  });

  revalidatePath("/admin/disponibilidad");
}

const esquemaRangoFechas = z
  .object({
    tourId: z.string().min(1),
    fechaInicio: esquemaFechaIso,
    fechaFin: esquemaFechaIso,
  })
  .refine((datos) => datos.fechaInicio <= datos.fechaFin, {
    message: "La fecha de inicio debe ser anterior o igual a la fecha de fin.",
    path: ["fechaFin"],
  });

const esquemaBloquearRango = z
  .object({
    tourId: z.string().min(1),
    fechaInicio: esquemaFechaIso,
    fechaFin: esquemaFechaIso,
    motivo: z.string().max(200).optional(),
  })
  .refine((datos) => datos.fechaInicio <= datos.fechaFin, {
    message: "La fecha de inicio debe ser anterior o igual a la fecha de fin.",
    path: ["fechaFin"],
  });

export async function bloquearRango(
  tourId: string,
  fechaInicio: string,
  fechaFin: string,
  motivo?: string
): Promise<void> {
  await exigirSesionAdmin();
  const datos = analizarZod(esquemaBloquearRango, {
    tourId,
    fechaInicio,
    fechaFin,
    motivo,
  });

  if (datos.fechaInicio < obtenerFechaHoyIsoUTC()) {
    throw new Error("No se puede bloquear una fecha pasada.");
  }

  const fechasIso = generarRangoFechasISO(datos.fechaInicio, datos.fechaFin);
  if (fechasIso.length > LIMITE_DIAS_RANGO) {
    throw new Error("El rango seleccionado es demasiado amplio.");
  }

  await prisma.$transaction(
    fechasIso.map((fechaIso) => {
      const fechaUTC = fechaIsoAFechaUTC(fechaIso);
      return prisma.disponibilidadTour.upsert({
        where: { tourId_fecha: { tourId: datos.tourId, fecha: fechaUTC } },
        create: {
          tourId: datos.tourId,
          fecha: fechaUTC,
          disponible: false,
          motivo: datos.motivo ?? null,
        },
        update: { disponible: false, motivo: datos.motivo ?? null },
      });
    })
  );

  revalidatePath("/admin/disponibilidad");
}

export async function desbloquearRango(
  tourId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<void> {
  await exigirSesionAdmin();
  const datos = analizarZod(esquemaRangoFechas, { tourId, fechaInicio, fechaFin });

  await prisma.disponibilidadTour.deleteMany({
    where: {
      tourId: datos.tourId,
      fecha: {
        gte: fechaIsoAFechaUTC(datos.fechaInicio),
        lte: fechaIsoAFechaUTC(datos.fechaFin),
      },
    },
  });

  revalidatePath("/admin/disponibilidad");
}
