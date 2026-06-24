import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
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

interface PropiedadesConfirmacionCliente {
  datos: DatosEmailReserva;
}

export function ConfirmacionCliente({ datos }: PropiedadesConfirmacionCliente) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu reserva {datos.numero} está confirmada</Preview>
      <Body
        style={{
          backgroundColor: CREMA,
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 32,
            maxWidth: 560,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              letterSpacing: 2,
              color: DORADO_OSCURO,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Mémoire Nomade
          </Text>

          <Heading style={{ color: CARBON, fontSize: 22, marginTop: 16, marginBottom: 4 }}>
            ¡Tu reserva está confirmada!
          </Heading>
          <Text style={{ color: GRIS, fontSize: 14, marginTop: 0 }}>
            Hola {datos.nombreCliente}, gracias por reservar con nosotros.
          </Text>

          <Section
            style={{
              backgroundColor: CREMA,
              borderRadius: 8,
              padding: "16px 20px",
              marginTop: 24,
              textAlign: "center",
            }}
          >
            <Text style={{ color: GRIS, fontSize: 12, margin: 0, textTransform: "uppercase" }}>
              Número de reserva
            </Text>
            <Text style={{ color: DORADO_OSCURO, fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>
              {datos.numero}
            </Text>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <Heading as="h2" style={{ color: CARBON, fontSize: 16 }}>
              Detalles del tour
            </Heading>
            <Text style={{ color: CARBON, fontSize: 14, margin: "4px 0" }}>
              {datos.tourNombre}
            </Text>
            <Text style={{ color: GRIS, fontSize: 14, margin: "4px 0" }}>
              {formatoFecha.format(datos.fecha)} · {datos.tourDuracion}
            </Text>
            <Text style={{ color: GRIS, fontSize: 14, margin: "4px 0" }}>
              {datos.numeroAdultos} adulto{datos.numeroAdultos !== 1 ? "s" : ""}
              {datos.numeroNinos > 0
                ? `, ${datos.numeroNinos} niño${datos.numeroNinos !== 1 ? "s" : ""}`
                : ""}
            </Text>
            {datos.opcionales.length > 0 ? (
              <Text style={{ color: GRIS, fontSize: 14, margin: "4px 0" }}>
                Opcionales: {datos.opcionales.map((opcional) => opcional.nombre).join(", ")}
              </Text>
            ) : null}
          </Section>

          <Hr style={{ borderColor: `${DORADO}33`, margin: "20px 0" }} />

          <Section>
            <table width="100%">
              <tbody>
                <tr>
                  <td>
                    <Text style={{ color: CARBON, fontSize: 16, fontWeight: 600, margin: 0 }}>
                      Total pagado
                    </Text>
                  </td>
                  <td align="right">
                    <Text style={{ color: DORADO_OSCURO, fontSize: 20, fontWeight: 700, margin: 0 }}>
                      {formatoMoneda.format(datos.precioTotal)}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={{ borderColor: `${DORADO}33`, margin: "20px 0" }} />

          <Heading as="h2" style={{ color: CARBON, fontSize: 16 }}>
            Qué incluye tu tour
          </Heading>
          {datos.tourIncluye.map((item) => (
            <Text key={item} style={{ color: GRIS, fontSize: 14, margin: "2px 0" }}>
              • {item}
            </Text>
          ))}

          <Heading as="h2" style={{ color: CARBON, fontSize: 16, marginTop: 20 }}>
            Punto de encuentro
          </Heading>
          <Text style={{ color: GRIS, fontSize: 14 }}>
            Te enviaremos la ubicación exacta del punto de encuentro 24 horas antes de tu
            tour.
          </Text>

          <Heading as="h2" style={{ color: CARBON, fontSize: 16, marginTop: 20 }}>
            Política de cancelación
          </Heading>
          <Text style={{ color: GRIS, fontSize: 14, margin: "2px 0" }}>
            Más de 30 días de antelación: 70% de reembolso
          </Text>
          <Text style={{ color: GRIS, fontSize: 14, margin: "2px 0" }}>
            Entre 15 y 30 días de antelación: 50% de reembolso
          </Text>
          <Text style={{ color: GRIS, fontSize: 14, margin: "2px 0" }}>
            Menos de 15 días de antelación o no show: sin reembolso
          </Text>

          <Hr style={{ borderColor: `${DORADO}33`, margin: "20px 0" }} />

          <Text style={{ color: GRIS, fontSize: 12, textAlign: "center" }}>
            ¿Tienes dudas? Escríbenos a {datos.emailContacto} o llámanos al{" "}
            {datos.telefonoContacto}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ConfirmacionCliente;
