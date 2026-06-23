import type { z } from "zod";

export function analizarZod<TEsquema extends z.ZodType>(
  esquema: TEsquema,
  datos: unknown
): z.infer<TEsquema> {
  const resultado = esquema.safeParse(datos);

  if (!resultado.success) {
    const primerError = resultado.error.issues[0];
    throw new Error(primerError?.message ?? "Los datos enviados no son válidos.");
  }

  return resultado.data;
}
