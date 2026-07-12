type ContextoLog = Record<string, unknown> | unknown;

// Error.message, .code y .stack son propiedades no enumerables: si un Error
// queda anidado dentro del objeto de contexto (p. ej. { error, numero }),
// JSON.stringify lo serializa como "{}" y el mensaje real se pierde.
function serializarError(error: Error): Record<string, unknown> {
  const codigo = (error as { code?: unknown }).code;
  return {
    mensajeError: error.message,
    ...(codigo !== undefined ? { codigoError: String(codigo) } : {}),
    stack: error.stack,
  };
}

function serializarContexto(contexto: ContextoLog): Record<string, unknown> {
  if (contexto instanceof Error) {
    return serializarError(contexto);
  }
  if (contexto && typeof contexto === "object") {
    const resultado: Record<string, unknown> = {};
    for (const [clave, valor] of Object.entries(contexto)) {
      resultado[clave] = valor instanceof Error ? serializarError(valor) : valor;
    }
    return resultado;
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
