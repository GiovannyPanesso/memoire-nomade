"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EstadoReserva } from "@prisma/client";
import { prisma } from "@/lib/prisma/cliente";
import { exigirSesionAdmin } from "@/lib/auth/exigir-sesion-admin";

const esquemaCambiarEstado = z.object({
  id: z.string().min(1),
  estado: z.nativeEnum(EstadoReserva),
});

export async function cambiarEstadoReserva(id: string, estado: EstadoReserva) {
  await exigirSesionAdmin();
  const datos = esquemaCambiarEstado.parse({ id, estado });

  await prisma.reserva.update({
    where: { id: datos.id },
    data: { estado: datos.estado },
  });

  revalidatePath(`/admin/reservas/${datos.id}`);
  revalidatePath("/admin/reservas");
}

const esquemaActualizarNotas = z.object({
  id: z.string().min(1),
  notas: z.string().max(2000),
});

export async function actualizarNotasReserva(id: string, notas: string) {
  await exigirSesionAdmin();
  const datos = esquemaActualizarNotas.parse({ id, notas });

  await prisma.reserva.update({
    where: { id: datos.id },
    data: { notas: datos.notas },
  });

  revalidatePath(`/admin/reservas/${datos.id}`);
}
