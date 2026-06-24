// El worker que renderiza este documento (render-pdf-worker.ts) se ejecuta
// con tsx fuera del runtime de Next, donde el JSX de este archivo se
// transforma con el modo clásico (React.createElement) y necesita a React
// explícitamente en scope.
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DatosEmailReserva } from "@/types";

const DORADO = "#C9A84C";
const DORADO_OSCURO = "#A8872D";
const CREMA = "#F5F0E8";
const CARBON = "#1A1A2E";
const GRIS = "#6B7280";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const estilos = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: CARBON, fontFamily: "Helvetica" },
  marca: {
    fontSize: 11,
    color: DORADO_OSCURO,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  tituloPrincipal: { fontSize: 20, marginBottom: 4 },
  subtitulo: { fontSize: 11, color: GRIS, marginBottom: 20 },
  cajaNumero: {
    backgroundColor: CREMA,
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  etiquetaNumero: {
    fontSize: 9,
    color: GRIS,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  numero: { fontSize: 26, color: DORADO_OSCURO, fontWeight: "bold" },
  seccion: { marginBottom: 16 },
  tituloSeccion: { fontSize: 13, marginBottom: 6, color: CARBON },
  fila: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  filaTexto: { color: GRIS },
  filaValor: { color: CARBON },
  lineaSeparadora: {
    borderBottomWidth: 1,
    borderBottomColor: `${DORADO}55`,
    marginVertical: 12,
  },
  totalFila: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  totalEtiqueta: { fontSize: 14, color: CARBON },
  totalValor: { fontSize: 18, color: DORADO_OSCURO, fontWeight: "bold" },
  itemTexto: { color: GRIS, marginBottom: 2 },
  footer: { marginTop: 24, fontSize: 9, color: GRIS, textAlign: "center" },
});

interface PropiedadesPlantillaPdfReserva {
  datos: DatosEmailReserva;
}

export function PlantillaPdfReserva({ datos }: PropiedadesPlantillaPdfReserva) {
  return (
    <Document title={`Reserva ${datos.numero}`}>
      <Page size="A4" style={estilos.page}>
        <Text style={estilos.marca}>Mémoire Nomade</Text>
        <Text style={estilos.tituloPrincipal}>Comprobante de reserva</Text>
        <Text style={estilos.subtitulo}>
          Gracias por reservar con nosotros, {datos.nombreCliente}.
        </Text>

        <View style={estilos.cajaNumero}>
          <Text style={estilos.etiquetaNumero}>Número de reserva</Text>
          <Text style={estilos.numero}>{datos.numero}</Text>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Detalles del tour</Text>
          <View style={estilos.fila}>
            <Text style={estilos.filaTexto}>Tour</Text>
            <Text style={estilos.filaValor}>{datos.tourNombre}</Text>
          </View>
          <View style={estilos.fila}>
            <Text style={estilos.filaTexto}>Fecha</Text>
            <Text style={estilos.filaValor}>{formatoFecha.format(datos.fecha)}</Text>
          </View>
          <View style={estilos.fila}>
            <Text style={estilos.filaTexto}>Duración</Text>
            <Text style={estilos.filaValor}>{datos.tourDuracion}</Text>
          </View>
          <View style={estilos.fila}>
            <Text style={estilos.filaTexto}>Grupo</Text>
            <Text style={estilos.filaValor}>
              {datos.numeroAdultos} adulto{datos.numeroAdultos !== 1 ? "s" : ""}
              {datos.numeroNinos > 0
                ? `, ${datos.numeroNinos} niño${datos.numeroNinos !== 1 ? "s" : ""}`
                : ""}
            </Text>
          </View>
        </View>

        {datos.opcionales.length > 0 ? (
          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>Opcionales</Text>
            {datos.opcionales.map((opcional, indice) => (
              <View key={indice} style={estilos.fila}>
                <Text style={estilos.filaTexto}>
                  {opcional.nombre} ({opcional.cantidad}{" "}
                  {opcional.cantidad === 1 ? "persona" : "personas"})
                </Text>
                <Text style={estilos.filaValor}>
                  {formatoMoneda.format(opcional.precio * opcional.cantidad)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={estilos.lineaSeparadora} />

        <View style={estilos.totalFila}>
          <Text style={estilos.totalEtiqueta}>Total pagado</Text>
          <Text style={estilos.totalValor}>{formatoMoneda.format(datos.precioTotal)}</Text>
        </View>

        <View style={estilos.lineaSeparadora} />

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Qué incluye tu tour</Text>
          {datos.tourIncluye.map((item) => (
            <Text key={item} style={estilos.itemTexto}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Política de cancelación</Text>
          <Text style={estilos.itemTexto}>
            Más de 30 días de antelación: 70% de reembolso
          </Text>
          <Text style={estilos.itemTexto}>
            Entre 15 y 30 días de antelación: 50% de reembolso
          </Text>
          <Text style={estilos.itemTexto}>
            Menos de 15 días de antelación o no show: sin reembolso
          </Text>
        </View>

        <Text style={estilos.footer}>
          ¿Tienes dudas? Escríbenos a {datos.emailContacto} o llámanos al{" "}
          {datos.telefonoContacto}
        </Text>
      </Page>
    </Document>
  );
}
