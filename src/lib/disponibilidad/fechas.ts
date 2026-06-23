import { es } from "date-fns/locale";

export const LOCALE_ES = es;

const RELLENO_DOS_DIGITOS = 2;

// Las fechas de calendario se manejan en hora local del navegador, ya que
// tanto react-day-picker como la percepción de "hoy" del usuario operan en
// hora local. El string ISO resultante (yyyy-MM-dd) es el mismo sin importar
// la zona horaria, así que es seguro enviarlo al servidor.
export function formatearFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(RELLENO_DOS_DIGITOS, "0");
  const dia = String(fecha.getDate()).padStart(RELLENO_DOS_DIGITOS, "0");
  return `${anio}-${mes}-${dia}`;
}

export function parsearFechaISO(fechaIso: string): Date {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function obtenerFechaHoyISO(): string {
  return formatearFechaISO(new Date());
}

export function esFechaPasada(fechaIso: string): boolean {
  return fechaIso < obtenerFechaHoyISO();
}

// Las columnas `@db.Date` de Prisma se representan como medianoche UTC, por
// lo que las consultas y acciones del servidor deben convertir hacia/desde
// ISO usando UTC para que coincidan exactamente con el valor almacenado.
export function fechaIsoAFechaUTC(fechaIso: string): Date {
  return new Date(`${fechaIso}T00:00:00.000Z`);
}

export function fechaUTCAFechaISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
