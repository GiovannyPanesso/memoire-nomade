import type { Prisma, PrismaClient } from "@prisma/client";

const PREFIJO = "MN";
const LONGITUD_CORRELATIVO = 3;

type ClientePrisma = PrismaClient | Prisma.TransactionClient;

// Debe ejecutarse dentro de una transacción Prisma junto con la creación de
// la Reserva: el campo `numero` es único, así que una colisión de correlativo
// entre dos webhooks concurrentes hace fallar la segunda escritura en vez de
// duplicar el número.
export async function generarNumeroReserva(
  cliente: ClientePrisma,
  fecha: Date = new Date()
): Promise<string> {
  const anio = fecha.getFullYear();
  const prefijoAnio = `${PREFIJO}-${anio}-`;

  const ultimaReserva = await cliente.reserva.findFirst({
    where: { numero: { startsWith: prefijoAnio } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const ultimoCorrelativo = ultimaReserva
    ? Number(ultimaReserva.numero.slice(prefijoAnio.length))
    : 0;

  const siguienteCorrelativo = String(ultimoCorrelativo + 1).padStart(
    LONGITUD_CORRELATIVO,
    "0"
  );

  return `${prefijoAnio}${siguienteCorrelativo}`;
}
