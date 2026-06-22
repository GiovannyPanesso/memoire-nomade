import { differenceInCalendarDays } from "date-fns";
import type { PoliticaCancelacion } from "@/types";

export function calcularPoliticaCancelacion(
  fechaTour: Date,
  ahora: Date = new Date()
): PoliticaCancelacion {
  const diasAntelacion = differenceInCalendarDays(fechaTour, ahora);

  if (diasAntelacion > 30) {
    return {
      porcentajeReembolso: 70,
      descripcion: "Más de 30 días de antelación",
    };
  }

  // La tabla de políticas solo define explícitamente ">30 días" y "<15 días";
  // el tramo de 15 a 30 días se trata como el nivel intermedio del 50%.
  if (diasAntelacion >= 15) {
    return {
      porcentajeReembolso: 50,
      descripcion: "Entre 15 y 30 días de antelación",
    };
  }

  return {
    porcentajeReembolso: 0,
    descripcion: "Menos de 15 días de antelación",
  };
}
