import { EstadoReserva } from "@prisma/client";

const ESTILOS_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADA: "bg-emerald-100 text-emerald-800",
  CANCELADA: "bg-red-100 text-red-800",
  COMPLETADA: "bg-marca-dorado/15 text-marca-dorado-oscuro",
};

const ETIQUETAS_ESTADO: Record<EstadoReserva, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
};

interface PropiedadesInsigniaEstado {
  estado: EstadoReserva;
}

export function InsigniaEstado({ estado }: PropiedadesInsigniaEstado) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ESTILOS_ESTADO[estado]}`}
    >
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}
