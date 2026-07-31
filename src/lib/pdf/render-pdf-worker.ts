// Se ejecuta como proceso hijo independiente (ver generar-pdf-reserva.ts),
// nunca se importa directamente desde código que corre dentro de Next.js.
//
// @react-pdf/renderer usa su propio reconciler de React. Cuando el render
// se invoca dentro del proceso del servidor de Next, este termina cargando
// una segunda copia de React distinta a la del bundle de la ruta, y el
// reconciler rechaza los elementos JSX resultantes con
// "Objects are not valid as a React child". Generar el PDF en un proceso
// Node aparte, con su propia resolución de módulos limpia, evita el problema.
import { renderToBuffer } from "@react-pdf/renderer";
// Import relativo a propósito: este archivo lo ejecuta tsx directamente (ver
// generar-pdf-reserva.ts), fuera del bundler de Next, y en el lambda de
// Vercel no hay tsconfig.json para que tsx resuelva el alias "@/*".
import { PlantillaPdfReserva } from "./plantilla-reserva";
import type { DatosEmailReserva } from "@/types";

async function leerEntradaCompleta(): Promise<string> {
  const fragmentos: Buffer[] = [];
  for await (const fragmento of process.stdin) {
    fragmentos.push(fragmento as Buffer);
  }
  return Buffer.concat(fragmentos).toString("utf-8");
}

async function main() {
  const entrada = await leerEntradaCompleta();
  const datosCrudos = JSON.parse(entrada) as DatosEmailReserva;
  const datos: DatosEmailReserva = {
    ...datosCrudos,
    fecha: new Date(datosCrudos.fecha),
  };

  const pdf = await renderToBuffer(PlantillaPdfReserva({ datos }));
  process.stdout.write(pdf);
}

main().catch((error) => {
  process.stderr.write(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
