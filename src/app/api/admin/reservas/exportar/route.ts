import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";
import {
  obtenerReservasParaExportar,
  parsearFiltrosReservas,
} from "@/lib/reservas/consultas";
import type { ReservaListado } from "@/types";

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Excel/LibreOffice interpretan una celda que empieza por =, +, - o @ como
// fórmula. Sin neutralizarlo, un cliente podría reservar con un nombre como
// "=cmd|'/c calc'!A1" y comprometer la máquina del admin al abrir el CSV.
function neutralizarFormulaCsv(valor: string): string {
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

function escaparCampoCsv(valor: string): string {
  const valorSeguro = neutralizarFormulaCsv(valor);
  if (/[",\n]/.test(valorSeguro)) {
    return `"${valorSeguro.replace(/"/g, '""')}"`;
  }
  return valorSeguro;
}

function construirFilaCsv(reserva: ReservaListado): string {
  return [
    reserva.numero,
    reserva.nombreCliente,
    reserva.emailCliente,
    reserva.tourNombre,
    formatoFecha.format(reserva.fecha),
    String(reserva.numeroPersonas),
    reserva.precioTotal.toFixed(2),
    reserva.estado,
    formatoFecha.format(reserva.creadoEn),
  ]
    .map(escaparCampoCsv)
    .join(",");
}

export async function GET(request: NextRequest) {
  const sesion = await getServerSession(opcionesAuth);

  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filtros = parsearFiltrosReservas(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  const reservas = await obtenerReservasParaExportar(filtros);

  const encabezado =
    "Número,Cliente,Email,Tour,Fecha del tour,Personas,Precio total,Estado,Fecha de creación";
  const BOM_UTF8 = String.fromCharCode(0xfeff);
  const csv = BOM_UTF8 + [encabezado, ...reservas.map(construirFilaCsv)].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="reservas.csv"',
    },
  });
}
