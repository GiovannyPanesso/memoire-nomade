import { prisma } from "@/lib/prisma/cliente";
import type { ConfiguracionNegocio, AdminListado, ImagenesSitio } from "@/types";

const ID_CONFIGURACION = "singleton";

export async function obtenerConfiguracion(): Promise<ConfiguracionNegocio> {
  const configuracion = await prisma.configuracion.upsert({
    where: { id: ID_CONFIGURACION },
    update: {},
    create: { id: ID_CONFIGURACION, emailContacto: "", telefonoContacto: "" },
  });

  return {
    nombreNegocio: configuracion.nombreNegocio,
    emailContacto: configuracion.emailContacto,
    telefonoContacto: configuracion.telefonoContacto,
  };
}

export async function obtenerAdmins(): Promise<AdminListado[]> {
  return prisma.admin.findMany({
    select: { id: true, nombre: true, email: true },
    orderBy: { creadoEn: "asc" },
  });
}

export async function obtenerImagenesSitio(): Promise<ImagenesSitio> {
  const configuracion = await prisma.configuracion.upsert({
    where: { id: ID_CONFIGURACION },
    update: {},
    create: { id: ID_CONFIGURACION, emailContacto: "", telefonoContacto: "" },
  });

  return {
    logoUrl: configuracion.logoUrl,
    imagenCabecera: configuracion.imagenCabecera,
    imagenSeccion1: configuracion.imagenSeccion1,
    imagenSeccion2: configuracion.imagenSeccion2,
    imagenSeccion3: configuracion.imagenSeccion3,
    imagenGaleria1: configuracion.imagenGaleria1,
    imagenGaleria2: configuracion.imagenGaleria2,
    imagenGaleria3: configuracion.imagenGaleria3,
  };
}
