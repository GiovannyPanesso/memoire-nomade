"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import { exigirSesionAdmin } from "@/lib/auth/exigir-sesion-admin";
import { analizarZod } from "@/lib/validacion/analizar-zod";
import type { ConfiguracionNegocio, DatosImagenesSitioFormulario } from "@/types";

const RONDAS_BCRYPT = 12;
const ID_CONFIGURACION = "singleton";

const esquemaConfiguracion = z.object({
  nombreNegocio: z.string().min(1, "El nombre del negocio es obligatorio"),
  emailContacto: z.string().email("Debe ser un email válido"),
  telefonoContacto: z.string().min(1, "El teléfono de contacto es obligatorio"),
});

export async function actualizarConfiguracion(
  datos: ConfiguracionNegocio
): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaConfiguracion, datos);

  await prisma.configuracion.upsert({
    where: { id: ID_CONFIGURACION },
    update: datosValidados,
    create: { id: ID_CONFIGURACION, ...datosValidados },
  });

  revalidatePath("/admin/configuracion");
}

const esquemaCrearAdmin = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Debe ser un email válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmarPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

interface DatosNuevoAdmin {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
}

export async function crearAdmin(datos: DatosNuevoAdmin): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaCrearAdmin, datos);

  const existente = await prisma.admin.findUnique({
    where: { email: datosValidados.email },
  });

  if (existente) {
    throw new Error("Ya existe un administrador con ese email.");
  }

  const passwordHash = await bcrypt.hash(datosValidados.password, RONDAS_BCRYPT);

  try {
    await prisma.admin.create({
      data: {
        nombre: datosValidados.nombre,
        email: datosValidados.email,
        passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un administrador con ese email.");
    }
    throw error;
  }

  revalidatePath("/admin/configuracion");
}

const esquemaIdAdmin = z.string().min(1);

export async function eliminarAdmin(id: string): Promise<void> {
  await exigirSesionAdmin();
  const idValidado = analizarZod(esquemaIdAdmin, id);

  const totalAdmins = await prisma.admin.count();
  if (totalAdmins <= 1) {
    throw new Error("No se puede eliminar el único administrador.");
  }

  await prisma.admin.delete({ where: { id: idValidado } });

  revalidatePath("/admin/configuracion");
}

const esquemaCambiarPassword = z
  .object({
    passwordActual: z.string().min(1, "Ingresa tu contraseña actual"),
    passwordNueva: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmarPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((datos) => datos.passwordNueva === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

interface DatosCambiarPassword {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export async function cambiarPasswordPropia(
  datos: DatosCambiarPassword
): Promise<void> {
  const sesion = await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaCambiarPassword, datos);

  const admin = await prisma.admin.findUnique({
    where: { id: sesion.user.id },
  });

  if (!admin) {
    throw new Error("No se encontró tu cuenta de administrador.");
  }

  const passwordValida = await bcrypt.compare(
    datosValidados.passwordActual,
    admin.passwordHash
  );

  if (!passwordValida) {
    throw new Error("La contraseña actual no es correcta.");
  }

  const passwordHash = await bcrypt.hash(
    datosValidados.passwordNueva,
    RONDAS_BCRYPT
  );

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash },
  });
}

function esUrlValida(valor: string): boolean {
  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}

const esquemaCampoImagen = z
  .string()
  .trim()
  .refine((valor) => valor === "" || esUrlValida(valor), {
    message: "Debe ser una URL válida",
  })
  .transform((valor) => (valor === "" ? null : valor));

const esquemaImagenesSitio = z.object({
  logoUrl: esquemaCampoImagen,
  imagenCabecera: esquemaCampoImagen,
  imagenSeccion1: esquemaCampoImagen,
  imagenSeccion2: esquemaCampoImagen,
  imagenSeccion3: esquemaCampoImagen,
  imagenGaleria1: esquemaCampoImagen,
  imagenGaleria2: esquemaCampoImagen,
  imagenGaleria3: esquemaCampoImagen,
});

export async function actualizarImagenesSitio(
  datos: DatosImagenesSitioFormulario
): Promise<void> {
  await exigirSesionAdmin();
  const datosValidados = analizarZod(esquemaImagenesSitio, datos);

  await prisma.configuracion.upsert({
    where: { id: ID_CONFIGURACION },
    update: datosValidados,
    create: {
      id: ID_CONFIGURACION,
      emailContacto: "",
      telefonoContacto: "",
      ...datosValidados,
    },
  });

  revalidatePath("/admin/configuracion");
}
