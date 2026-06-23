import { prisma } from "@/lib/prisma/cliente";
import type { TourListado, TourDetalle } from "@/types";

export async function obtenerTours(): Promise<TourListado[]> {
  const tours = await prisma.tour.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { tarifas: true } } },
  });

  return tours.map((tour) => ({
    id: tour.id,
    nombre: tour.nombre,
    slug: tour.slug,
    duracion: tour.duracion,
    numeroTarifas: tour._count.tarifas,
    activo: tour.activo,
  }));
}

export async function obtenerTourPorId(id: string): Promise<TourDetalle | null> {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { tarifas: { orderBy: { creadoEn: "asc" } } },
  });

  if (!tour) {
    return null;
  }

  return {
    id: tour.id,
    slug: tour.slug,
    nombre: tour.nombre,
    descripcion: tour.descripcion,
    duracion: tour.duracion,
    lugaresInteres: tour.lugaresInteres,
    incluye: tour.incluye,
    noIncluye: tour.noIncluye,
    imagenUrl: tour.imagenUrl,
    activo: tour.activo,
    tarifas: tour.tarifas.map((tarifa) => ({
      id: tarifa.id,
      minPersonas: tarifa.minPersonas,
      maxPersonas: tarifa.maxPersonas,
      precio: tarifa.precio.toNumber(),
      esNino: tarifa.esNino,
      edadMaxNino: tarifa.edadMaxNino,
      esOpcional: tarifa.esOpcional,
      nombreOpcional: tarifa.nombreOpcional,
    })),
  };
}
