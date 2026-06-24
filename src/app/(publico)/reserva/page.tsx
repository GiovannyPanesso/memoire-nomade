import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { z } from "zod";
import { obtenerTourPorSlug } from "@/lib/tours/consultas";
import { calcularPrecioTotal } from "@/lib/tours/calculadora-precio";
import { fechaIsoAFechaUTC, esFechaPasada } from "@/lib/disponibilidad/fechas";
import { decodificarCantidadesOpcionales } from "@/lib/reservas/opcionales";
import { ResumenReserva } from "@/components/reservas/resumen-reserva";
import { FormularioReserva } from "@/components/reservas/formulario-reserva";

export const metadata: Metadata = {
  title: "Completa tu reserva | Mémoire Nomade",
};

const esquemaParametros = z.object({
  tour: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adultos: z.coerce.number().int().min(1),
  edadesNinos: z.string().optional(),
  opcionales: z.string().optional(),
});

interface PropiedadesPaginaReserva {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaReserva({ searchParams }: PropiedadesPaginaReserva) {
  const parametrosCrudos = await searchParams;
  const resultadoParametros = esquemaParametros.safeParse(parametrosCrudos);

  if (!resultadoParametros.success) {
    redirect("/tours");
  }

  const {
    tour: tourSlug,
    fecha,
    adultos,
    edadesNinos: edadesNinosCrudo,
    opcionales: opcionalesCrudo,
  } = resultadoParametros.data;

  if (esFechaPasada(fecha)) {
    redirect(`/tours/${tourSlug}`);
  }

  const tour = await obtenerTourPorSlug(tourSlug);
  if (!tour) {
    notFound();
  }

  const edadesNinos = edadesNinosCrudo
    ? edadesNinosCrudo
        .split(",")
        .map(Number)
        .filter((edad) => Number.isInteger(edad) && edad >= 0)
    : [];
  const totalPersonas = adultos + edadesNinos.length;

  // Una cantidad no puede superar el tamaño del grupo (defensa ante una URL
  // manipulada); el precio definitivo se vuelve a calcular y validar en
  // crear-payment-intent antes de cobrar nada.
  const cantidadesOpcionalesCrudas = decodificarCantidadesOpcionales(opcionalesCrudo);
  const cantidadesOpcionales = Object.fromEntries(
    Object.entries(cantidadesOpcionalesCrudas).map(([id, cantidad]) => [
      id,
      Math.min(cantidad, totalPersonas),
    ])
  );

  const resultadoPrecio = calcularPrecioTotal({
    tarifas: tour.tarifas,
    numeroAdultos: adultos,
    edadesNinos,
    cantidadesOpcionales,
  });

  if (resultadoPrecio.precioTotal <= 0) {
    redirect(`/tours/${tourSlug}`);
  }

  const opcionalesSeleccionados = tour.tarifas
    .filter((tarifa) => tarifa.esOpcional && (cantidadesOpcionales[tarifa.id] ?? 0) > 0)
    .map((tarifa) => ({
      id: tarifa.id,
      nombre: tarifa.nombreOpcional ?? "Opcional",
      precio: tarifa.precio,
      cantidad: cantidadesOpcionales[tarifa.id],
    }));

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-12 pt-24 lg:grid-cols-2 lg:items-start">
      <ResumenReserva
        tourNombre={tour.nombre}
        tourImagenUrl={tour.imagenUrl}
        tourDuracion={tour.duracion}
        fecha={fechaIsoAFechaUTC(fecha)}
        numeroAdultos={adultos}
        numeroNinos={edadesNinos.length}
        opcionales={opcionalesSeleccionados}
        resultadoPrecio={resultadoPrecio}
      />
      <FormularioReserva
        tourSlug={tour.slug}
        tourNombre={tour.nombre}
        fecha={fecha}
        numeroAdultos={adultos}
        edadesNinos={edadesNinos}
        cantidadesOpcionales={cantidadesOpcionales}
        precioTotal={resultadoPrecio.precioTotal}
      />
    </div>
  );
}
