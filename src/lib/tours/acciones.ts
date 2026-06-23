"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import { exigirSesionAdmin } from "@/lib/auth/exigir-sesion-admin";
import { analizarZod } from "@/lib/validacion/analizar-zod";
import type { DatosTourFormulario } from "@/types";

const esquemaTour = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener minúsculas, números y guiones"
    ),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  duracion: z.string().min(1, "La duración es obligatoria"),
  lugaresInteres: z.array(z.string().min(1)),
  incluye: z.array(z.string().min(1)),
  noIncluye: z.array(z.string().min(1)),
  imagenUrl: z.string().url("Debe ser una URL válida"),
  activo: z.boolean(),
});

export async function crearTour(
  datos: DatosTourFormulario
): Promise<{ id: string }> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaTour, datos);

  const existente = await prisma.tour.findUnique({
    where: { slug: datosValidados.slug },
  });

  if (existente) {
    throw new Error("Ya existe un tour con ese slug.");
  }

  try {
    const tour = await prisma.tour.create({ data: datosValidados });
    revalidatePath("/admin/tours");
    return { id: tour.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un tour con ese slug.");
    }
    throw error;
  }
}

export async function actualizarTour(
  id: string,
  datos: DatosTourFormulario
): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaTour, datos);

  const existente = await prisma.tour.findFirst({
    where: { slug: datosValidados.slug, NOT: { id } },
  });

  if (existente) {
    throw new Error("Ya existe otro tour con ese slug.");
  }

  try {
    await prisma.tour.update({ where: { id }, data: datosValidados });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe otro tour con ese slug.");
    }
    throw error;
  }

  revalidatePath("/admin/tours");
  revalidatePath(`/admin/tours/${id}`);
}

const esquemaIdTour = z.string().min(1);

export async function eliminarTour(id: string): Promise<void> {
  await exigirSesionAdmin();
  const idValidado = analizarZod(esquemaIdTour, id);

  try {
    await prisma.tour.delete({ where: { id: idValidado } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new Error(
        "No se puede eliminar este tour porque tiene reservas asociadas."
      );
    }
    throw error;
  }

  revalidatePath("/admin/tours");
}

export async function alternarActivoTour(
  id: string,
  activo: boolean
): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(
    z.object({ id: z.string().min(1), activo: z.boolean() }),
    { id, activo }
  );

  await prisma.tour.update({
    where: { id: datosValidados.id },
    data: { activo: datosValidados.activo },
  });

  revalidatePath("/admin/tours");
}

const esquemaTarifaRango = z
  .object({
    tourId: z.string().min(1),
    minPersonas: z.coerce.number().int().positive(),
    maxPersonas: z.coerce.number().int().positive(),
    precio: z.coerce.number().positive(),
  })
  .refine((datos) => datos.maxPersonas >= datos.minPersonas, {
    message: "El máximo de personas debe ser mayor o igual al mínimo.",
    path: ["maxPersonas"],
  });

export async function crearTarifaRango(
  tourId: string,
  formData: FormData
): Promise<void> {
  await exigirSesionAdmin();

  const datosValidados = analizarZod(esquemaTarifaRango, {
    tourId,
    minPersonas: formData.get("minPersonas"),
    maxPersonas: formData.get("maxPersonas"),
    precio: formData.get("precio"),
  });

  await prisma.tarifaTour.create({
    data: {
      tourId: datosValidados.tourId,
      minPersonas: datosValidados.minPersonas,
      maxPersonas: datosValidados.maxPersonas,
      precio: datosValidados.precio,
    },
  });

  revalidatePath(`/admin/tours/${tourId}`);
}

const esquemaTarifaNino = z.object({
  tourId: z.string().min(1),
  edadMaxNino: z.coerce.number().int().nonnegative(),
  precio: z.coerce.number().positive(),
});

export async function crearTarifaNino(
  tourId: string,
  formData: FormData
): Promise<void> {
  await exigirSesionAdmin();

  const datosValidados = analizarZod(esquemaTarifaNino, {
    tourId,
    edadMaxNino: formData.get("edadMaxNino"),
    precio: formData.get("precio"),
  });

  await prisma.tarifaTour.create({
    data: {
      tourId: datosValidados.tourId,
      esNino: true,
      edadMaxNino: datosValidados.edadMaxNino,
      precio: datosValidados.precio,
    },
  });

  revalidatePath(`/admin/tours/${tourId}`);
}

const esquemaTarifaOpcional = z.object({
  tourId: z.string().min(1),
  nombreOpcional: z.string().min(1, "El nombre del opcional es obligatorio"),
  precio: z.coerce.number().positive(),
});

export async function crearTarifaOpcional(
  tourId: string,
  formData: FormData
): Promise<void> {
  await exigirSesionAdmin();

  const datosValidados = analizarZod(esquemaTarifaOpcional, {
    tourId,
    nombreOpcional: formData.get("nombreOpcional"),
    precio: formData.get("precio"),
  });

  await prisma.tarifaTour.create({
    data: {
      tourId: datosValidados.tourId,
      esOpcional: true,
      nombreOpcional: datosValidados.nombreOpcional,
      precio: datosValidados.precio,
    },
  });

  revalidatePath(`/admin/tours/${tourId}`);
}

const esquemaEliminarTarifa = z.object({
  id: z.string().min(1),
  tourId: z.string().min(1),
});

export async function eliminarTarifa(id: string, tourId: string): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaEliminarTarifa, { id, tourId });

  await prisma.tarifaTour.delete({ where: { id: datosValidados.id } });

  revalidatePath(`/admin/tours/${datosValidados.tourId}`);
}
