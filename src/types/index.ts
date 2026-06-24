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

export interface TourPublico {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  imagenUrl: string;
  precioDesde: number;
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

export type EstadoDiaDisponibilidad =
  | "DISPONIBLE"
  | "CON_RESERVAS"
  | "BLOQUEADO"
  | "PASADO";

export interface DiaCalendarioAdmin {
  fecha: string; // Fecha en formato ISO yyyy-MM-dd
  estado: EstadoDiaDisponibilidad;
  numeroReservas: number;
}

export interface ReservaDelDia {
  id: string;
  nombreCliente: string;
  estado: EstadoReserva;
  creadoEn: Date;
}

export interface DetalleDiaDisponibilidad {
  fecha: string; // Fecha en formato ISO yyyy-MM-dd
  bloqueado: boolean;
  motivo: string | null;
  reservas: ReservaDelDia[];
}

export interface DisponibilidadPublicaTour {
  fechasNoDisponibles: string[]; // Fechas en formato ISO yyyy-MM-dd
}

export interface ConfiguracionNegocio {
  nombreNegocio: string;
  emailContacto: string;
  telefonoContacto: string;
}

export interface AdminListado {
  id: string;
  nombre: string;
  email: string;
}

export interface ImagenesSitio {
  logoUrl: string | null;
  imagenCabecera: string | null;
  imagenSeccion1: string | null;
  imagenSeccion2: string | null;
  imagenSeccion3: string | null;
  imagenGaleria1: string | null;
  imagenGaleria2: string | null;
  imagenGaleria3: string | null;
  imagenCliente1: string | null;
  imagenCliente2: string | null;
  imagenCliente3: string | null;
  imagenCliente4: string | null;
  imagenCliente5: string | null;
  imagenCliente6: string | null;
}

export interface DatosImagenesSitioFormulario {
  logoUrl: string;
  imagenCabecera: string;
  imagenSeccion1: string;
  imagenSeccion2: string;
  imagenSeccion3: string;
  imagenGaleria1: string;
  imagenGaleria2: string;
  imagenGaleria3: string;
  imagenCliente1: string;
  imagenCliente2: string;
  imagenCliente3: string;
  imagenCliente4: string;
  imagenCliente5: string;
  imagenCliente6: string;
}
