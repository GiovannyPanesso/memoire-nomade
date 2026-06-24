import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import type { TourListado, TourDetalle, TarifaTourDetalle, TourPublico } from "@/types";

type TourConTarifas = Prisma.TourGetPayload<{ include: { tarifas: true } }>;

function mapearTourDetalle(tour: TourConTarifas): TourDetalle {
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

function calcularPrecioDesde(tarifas: TarifaTourDetalle[]): number {
  const tarifasAdulto = tarifas.filter((tarifa) => !tarifa.esOpcional && !tarifa.esNino);
  const candidatas = tarifasAdulto.length > 0
    ? tarifasAdulto
    : tarifas.filter((tarifa) => !tarifa.esOpcional);

  if (candidatas.length === 0) {
    return 0;
  }

  return Math.min(...candidatas.map((tarifa) => tarifa.precio));
}

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

  return tour ? mapearTourDetalle(tour) : null;
}

export async function obtenerTourPorSlug(slug: string): Promise<TourDetalle | null> {
  const tour = await prisma.tour.findFirst({
    where: { slug, activo: true },
    include: { tarifas: { orderBy: { creadoEn: "asc" } } },
  });

  return tour ? mapearTourDetalle(tour) : null;
}

export async function obtenerToursPublicos(limite?: number): Promise<TourPublico[]> {
  const tours = await prisma.tour.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    take: limite,
    include: { tarifas: true },
  });

  return tours.map((tour) => {
    const tourDetalle = mapearTourDetalle(tour);
    return {
      id: tour.id,
      slug: tour.slug,
      nombre: tour.nombre,
      descripcion: tour.descripcion,
      duracion: tour.duracion,
      imagenUrl: tour.imagenUrl,
      precioDesde: calcularPrecioDesde(tourDetalle.tarifas),
    };
  });
}
