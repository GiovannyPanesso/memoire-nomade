import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/cliente";
import { obtenerDisponibilidadPublica } from "@/lib/disponibilidad/consultas";
import type { DisponibilidadPublicaTour } from "@/types";

const MESES_MAXIMOS_RANGO = 12;

function calcularDiferenciaMeses(mesInicio: string, mesFin: string): number {
  const [anioInicio, numeroMesInicio] = mesInicio.split("-").map(Number);
  const [anioFin, numeroMesFin] = mesFin.split("-").map(Number);
  return (anioFin - anioInicio) * 12 + (numeroMesFin - numeroMesInicio);
}

const esquemaQuery = z
  .object({
    mesInicio: z.string().regex(/^\d{4}-\d{2}$/, "Formato inválido (yyyy-MM)"),
    mesFin: z.string().regex(/^\d{4}-\d{2}$/, "Formato inválido (yyyy-MM)"),
  })
  .refine((datos) => datos.mesInicio <= datos.mesFin, {
    message: "mesInicio debe ser anterior o igual a mesFin",
    path: ["mesFin"],
  })
  .refine(
    (datos) => calcularDiferenciaMeses(datos.mesInicio, datos.mesFin) <= MESES_MAXIMOS_RANGO,
    {
      message: "El rango de meses solicitado es demasiado amplio",
      path: ["mesFin"],
    }
  );

interface PropiedadesRuta {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: PropiedadesRuta) {
  const { slug } = await params;

  const resultado = esquemaQuery.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error.issues[0]?.message ?? "Parámetros inválidos" },
      { status: 400 }
    );
  }

  const tour = await prisma.tour.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!tour) {
    return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 });
  }

  const fechasNoDisponibles = await obtenerDisponibilidadPublica(
    tour.id,
    resultado.data.mesInicio,
    resultado.data.mesFin
  );

  const data: DisponibilidadPublicaTour = { fechasNoDisponibles };
  return NextResponse.json({ data });
}
