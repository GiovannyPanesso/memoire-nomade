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

export interface FiltrosReservas {
  estado?: EstadoReserva;
  tourId?: string;
  busqueda?: string;
  pagina: number;
}

export interface ReservaListado {
  id: string;
  numero: string;
  nombreCliente: string;
  emailCliente: string;
  tourNombre: string;
  fecha: Date;
  numeroPersonas: number;
  precioTotal: number;
  estado: EstadoReserva;
  creadoEn: Date;
}

export interface ResultadoListadoReservas {
  reservas: ReservaListado[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
}

export interface OpcionalReserva {
  id: string;
  nombre: string;
  precio: number;
}

export interface ReservaDetalle {
  id: string;
  numero: string;
  tour: {
    id: string;
    nombre: string;
    duracion: string;
  };
  fecha: Date;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  paisCliente: string;
  numeroAdultos: number;
  numeroNinos: number;
  edadesNinos: number[];
  opcionales: OpcionalReserva[];
  precioTotal: number;
  estado: EstadoReserva;
  stripePaymentIntentId: string | null;
  mensajeCliente: string | null;
  notas: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TourParaFiltro {
  id: string;
  nombre: string;
}

export interface PoliticaCancelacion {
  porcentajeReembolso: number;
  descripcion: string;
}

export interface TourListado {
  id: string;
  nombre: string;
  slug: string;
  duracion: string;
  numeroTarifas: number;
  activo: boolean;
}

export interface TarifaTourDetalle {
  id: string;
  minPersonas: number | null;
  maxPersonas: number | null;
  precio: number;
  esNino: boolean;
  edadMaxNino: number | null;
  esOpcional: boolean;
  nombreOpcional: string | null;
}

export interface TourDetalle {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  lugaresInteres: string[];
  incluye: string[];
  noIncluye: string[];
  imagenUrl: string;
  activo: boolean;
  tarifas: TarifaTourDetalle[];
}

export interface DatosTourFormulario {
  nombre: string;
  slug: string;
  descripcion: string;
  duracion: string;
  lugaresInteres: string[];
  incluye: string[];
  noIncluye: string[];
  imagenUrl: string;
  activo: boolean;
}
