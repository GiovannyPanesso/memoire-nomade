import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";

export async function exigirSesionAdmin() {
  const sesion = await getServerSession(opcionesAuth);
  if (!sesion) {
    throw new Error("No autorizado");
  }
  return sesion;
}
