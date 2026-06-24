import type { TarifaTourDetalle } from "@/types";

interface ParametrosCalculoPrecio {
  tarifas: TarifaTourDetalle[];
  numeroAdultos: number;
  edadesNinos: number[];
  idsOpcionalesSeleccionados: string[];
}

export interface ResultadoCalculoPrecio {
  precioAdultos: number;
  precioNinos: number;
  precioOpcionales: number;
  precioTotal: number;
}

function obtenerTarifaAdulto(
  tarifas: TarifaTourDetalle[],
  numeroAdultos: number
): TarifaTourDetalle | null {
  const tarifasAdulto = tarifas
    .filter((tarifa) => !tarifa.esNino && !tarifa.esOpcional)
    .sort((a, b) => (a.minPersonas ?? 0) - (b.minPersonas ?? 0));

  if (tarifasAdulto.length === 0) {
    return null;
  }

  const coincidencia = tarifasAdulto.find(
    (tarifa) =>
      numeroAdultos >= (tarifa.minPersonas ?? 0) &&
      numeroAdultos <= (tarifa.maxPersonas ?? Infinity)
  );

  return coincidencia ?? tarifasAdulto[tarifasAdulto.length - 1];
}

function obtenerTarifaNino(tarifas: TarifaTourDetalle[]): TarifaTourDetalle | null {
  return tarifas.find((tarifa) => tarifa.esNino) ?? null;
}

export function calcularPrecioTotal({
  tarifas,
  numeroAdultos,
  edadesNinos,
  idsOpcionalesSeleccionados,
}: ParametrosCalculoPrecio): ResultadoCalculoPrecio {
  const tarifaAdulto = obtenerTarifaAdulto(tarifas, numeroAdultos);
  const tarifaNino = obtenerTarifaNino(tarifas);

  const precioAdultos = tarifaAdulto ? tarifaAdulto.precio * numeroAdultos : 0;

  const precioNinos = edadesNinos.reduce((acumulado, edad) => {
    if (tarifaNino && edad <= (tarifaNino.edadMaxNino ?? 0)) {
      return acumulado + tarifaNino.precio;
    }
    return acumulado + (tarifaAdulto?.precio ?? 0);
  }, 0);

  const totalPersonas = numeroAdultos + edadesNinos.length;

  const precioOpcionales = tarifas
    .filter(
      (tarifa) => tarifa.esOpcional && idsOpcionalesSeleccionados.includes(tarifa.id)
    )
    .reduce((acumulado, tarifa) => acumulado + tarifa.precio * totalPersonas, 0);

  return {
    precioAdultos,
    precioNinos,
    precioOpcionales,
    precioTotal: precioAdultos + precioNinos + precioOpcionales,
  };
}
