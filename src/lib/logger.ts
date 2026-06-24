type ContextoLog = Record<string, unknown> | unknown;

function serializarContexto(contexto: ContextoLog): Record<string, unknown> {
  if (contexto instanceof Error) {
    return { mensajeError: contexto.message, stack: contexto.stack };
  }
  if (contexto && typeof contexto === "object") {
    return contexto as Record<string, unknown>;
  }
  return { detalle: contexto };
}

export const logger = {
  error(mensaje: string, contexto?: ContextoLog): void {
    console.error(
      JSON.stringify({
        nivel: "error",
        mensaje,
        fecha: new Date().toISOString(),
        ...(contexto !== undefined ? serializarContexto(contexto) : {}),
      })
    );
  },
};
