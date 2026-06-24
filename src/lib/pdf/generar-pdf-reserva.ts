import { spawn } from "node:child_process";
import path from "node:path";
import type { DatosEmailReserva } from "@/types";

const RUTA_WORKER = path.join(process.cwd(), "src/lib/pdf/render-pdf-worker.ts");
const RUTA_CLI_TSX = path.join(process.cwd(), "node_modules/tsx/dist/cli.mjs");

// Renderiza el PDF en un proceso Node aparte (ver render-pdf-worker.ts) para
// evitar el conflicto de dos copias de React que se produce al usar
// @react-pdf/renderer dentro del propio proceso del servidor de Next.
export async function generarPdfReserva(datos: DatosEmailReserva): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proceso = spawn(
      process.execPath,
      [RUTA_CLI_TSX, RUTA_WORKER],
      { cwd: process.cwd(), stdio: ["pipe", "pipe", "pipe"] }
    );

    const stdoutFragmentos: Buffer[] = [];
    const stderrFragmentos: Buffer[] = [];

    proceso.stdout.on("data", (fragmento: Buffer) => stdoutFragmentos.push(fragmento));
    proceso.stderr.on("data", (fragmento: Buffer) => stderrFragmentos.push(fragmento));

    proceso.on("error", reject);

    proceso.on("close", (codigo) => {
      if (codigo !== 0) {
        reject(
          new Error(
            `El proceso de generación de PDF terminó con código ${codigo}: ${Buffer.concat(
              stderrFragmentos
            ).toString("utf-8")}`
          )
        );
        return;
      }
      resolve(Buffer.concat(stdoutFragmentos));
    });

    proceso.stdin.write(JSON.stringify(datos));
    proceso.stdin.end();
  });
}

export function nombreArchivoPdfReserva(numero: string): string {
  return `reserva-${numero}.pdf`;
}
