import { prisma } from "@/lib/prisma/cliente";
import type { ConfiguracionNegocio, AdminListado } from "@/types";

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
