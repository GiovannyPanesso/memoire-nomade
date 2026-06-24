import type { Prisma } from "@prisma/client";
import type { OpcionalEmailReserva, OpcionalSeleccionadoReserva } from "@/types";

const CANTIDAD_LEGADO = 1;

// Reservas creadas antes de soportar cantidades guardaban solo un array de
// ids (string[]). Las tratamos como cantidad 1 por id para no romper datos
// existentes.
export function parsearOpcionalesSeleccionados(
  valor: Prisma.JsonValue
): OpcionalSeleccionadoReserva[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.flatMap((elemento): OpcionalSeleccionadoReserva[] => {
    if (typeof elemento === "string") {
      return [{ tarifaId: elemento, cantidad: CANTIDAD_LEGADO }];
    }
    if (
      elemento &&
      typeof elemento === "object" &&
      "tarifaId" in elemento &&
      typeof elemento.tarifaId === "string"
    ) {
      const cantidad = "cantidad" in elemento ? Number(elemento.cantidad) : CANTIDAD_LEGADO;
      return [{ tarifaId: elemento.tarifaId, cantidad: Number.isFinite(cantidad) ? cantidad : CANTIDAD_LEGADO }];
    }
    return [];
  });
}

export function serializarOpcionalesSeleccionados(
  opcionales: OpcionalSeleccionadoReserva[]
): Prisma.JsonArray {
  return opcionales.map((opcional) => ({
    tarifaId: opcional.tarifaId,
    cantidad: opcional.cantidad,
  }));
}

// Codifica/decodifica cantidades de opcionales como "id:cantidad,id:cantidad"
// para transportarlas en query params de URL y en metadata de Stripe
// (que solo acepta valores string).
export function codificarCantidadesOpcionales(
  cantidades: Record<string, number>
): string {
  return Object.entries(cantidades)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => `${id}:${cantidad}`)
    .join(",");
}

export function decodificarCantidadesOpcionales(
  valor: string | undefined
): Record<string, number> {
  if (!valor) {
    return {};
  }

  return valor.split(",").reduce<Record<string, number>>((acumulado, par) => {
    const [id, cantidadCrudo] = par.split(":");
    const cantidad = Number(cantidadCrudo);
    if (id && Number.isInteger(cantidad) && cantidad > 0) {
      acumulado[id] = cantidad;
    }
    return acumulado;
  }, {});
}

interface TarifaOpcionalSimple {
  id: string;
  nombreOpcional: string | null;
  precio: number;
}

// Cruza los opcionales seleccionados de una reserva con las tarifas reales
// del tour (nombre y precio vigentes) para mostrarlos en emails y PDF.
export function construirOpcionalesEmail(
  tarifasOpcionales: TarifaOpcionalSimple[],
  seleccionados: OpcionalSeleccionadoReserva[]
): OpcionalEmailReserva[] {
  const tarifasPorId = new Map(tarifasOpcionales.map((tarifa) => [tarifa.id, tarifa]));

  return seleccionados.flatMap((seleccionado): OpcionalEmailReserva[] => {
    const tarifa = tarifasPorId.get(seleccionado.tarifaId);
    if (!tarifa) {
      return [];
    }
    return [
      {
        nombre: tarifa.nombreOpcional ?? "Opcional",
        precio: tarifa.precio,
        cantidad: seleccionado.cantidad,
      },
    ];
  });
}
