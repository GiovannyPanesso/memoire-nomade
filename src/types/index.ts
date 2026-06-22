import type { EstadoReserva } from "@prisma/client";

export interface ResumenDashboard {
  reservasHoy: number;
  reservasSemana: number;
  ingresosMes: number;
  totalReservas: number;
}

export interface ReservaReciente {
  id: string;
  numero: string;
  nombreCliente: string;
  tourNombre: string;
  fecha: Date;
  precioTotal: number;
  estado: EstadoReserva;
}
