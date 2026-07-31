import { prisma } from "@/lib/prisma/cliente";

const PROBABILIDAD_LIMPIEZA = 0.02;
const ANTIGUEDAD_LIMPIEZA_MS = 24 * 60 * 60 * 1000;

export interface ResultadoLimite {
  permitido: boolean;
  bloqueadoHasta?: Date;
}

// Best-effort: la tabla limites_tasa acumula una fila por ventana/clave, así
// que en cada escritura hay una probabilidad baja de purgar filas viejas para
// que no crezca sin límite. No es un cron dedicado, pero evita mantenimiento manual.
async function limpiarRegistrosAntiguosOcasional(): Promise<void> {
  if (Math.random() >= PROBABILIDAD_LIMPIEZA) {
    return;
  }
  const limite = new Date(Date.now() - ANTIGUEDAD_LIMPIEZA_MS);
  await prisma.limiteTasa
    .deleteMany({ where: { actualizadoEn: { lt: limite } } })
    .catch(() => {});
}

// Ventana fija: limita cuántas peticiones puede hacer una clave (normalmente
// "ruta:ip") dentro de un intervalo de tiempo. El índice de ventana forma
// parte de la clave de la fila, así que el reinicio de la ventana es
// implícito (no hace falta leer-y-decidir si tocaba reiniciar el contador).
export async function verificarLimiteVentana(
  clave: string,
  maxPeticiones: number,
  ventanaMs: number
): Promise<ResultadoLimite> {
  void limpiarRegistrosAntiguosOcasional();

  const indiceVentana = Math.floor(Date.now() / ventanaMs);
  const claveVentana = `${clave}:${indiceVentana}`;

  const registro = await prisma.limiteTasa.upsert({
    where: { clave: claveVentana },
    create: { clave: claveVentana, intentos: 1 },
    update: { intentos: { increment: 1 } },
  });

  return { permitido: registro.intentos <= maxPeticiones };
}

// Bloqueo tras intentos fallidos consecutivos (p. ej. login de admin: la
// clave persiste entre ventanas hasta que se registra un éxito o expira el
// bloqueo, a diferencia del limitador de ventana fija de arriba).
export async function estaBloqueado(clave: string): Promise<ResultadoLimite> {
  const registro = await prisma.limiteTasa.findUnique({ where: { clave } });
  if (registro?.bloqueadoHasta && registro.bloqueadoHasta > new Date()) {
    return { permitido: false, bloqueadoHasta: registro.bloqueadoHasta };
  }
  return { permitido: true };
}

export async function registrarIntentoFallido(
  clave: string,
  maxIntentos: number,
  bloqueoMs: number
): Promise<ResultadoLimite> {
  void limpiarRegistrosAntiguosOcasional();

  const registro = await prisma.limiteTasa.upsert({
    where: { clave },
    create: { clave, intentos: 1 },
    update: { intentos: { increment: 1 } },
  });

  if (registro.intentos >= maxIntentos) {
    const bloqueadoHasta = new Date(Date.now() + bloqueoMs);
    await prisma.limiteTasa.update({
      where: { clave },
      data: { bloqueadoHasta, intentos: 0 },
    });
    return { permitido: false, bloqueadoHasta };
  }

  return { permitido: true };
}

export async function limpiarIntentosFallidos(clave: string): Promise<void> {
  await prisma.limiteTasa.deleteMany({ where: { clave } });
}

type CabecerasPeticion =
  | Record<string, string | string[] | undefined>
  | Headers
  | null
  | undefined;

// Extrae la IP del cliente de las cabeceras de proxy (Vercel añade
// x-forwarded-for). No es infalible si algún día se sirve sin un proxy de
// confianza delante, pero es el mejor dato disponible en este despliegue.
export function extraerIpDeCabeceras(cabeceras: CabecerasPeticion): string {
  function obtener(nombre: string): string | undefined {
    if (!cabeceras) {
      return undefined;
    }
    if (cabeceras instanceof Headers) {
      return cabeceras.get(nombre) ?? undefined;
    }
    const valor = cabeceras[nombre];
    return Array.isArray(valor) ? valor[0] : valor;
  }

  const reenviada = obtener("x-forwarded-for");
  if (reenviada) {
    return reenviada.split(",")[0]?.trim() || "desconocida";
  }
  return obtener("x-real-ip") ?? "desconocida";
}
