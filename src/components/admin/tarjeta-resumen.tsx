interface PropiedadesTarjetaResumen {
  titulo: string;
  valor: string;
}

export function TarjetaResumen({ titulo, valor }: PropiedadesTarjetaResumen) {
  return (
    <div className="rounded-lg border border-marca-dorado/20 bg-white p-5">
      <p className="text-sm text-marca-gris">{titulo}</p>
      <p className="mt-2 font-serif text-2xl text-marca-carbon">{valor}</p>
    </div>
  );
}
