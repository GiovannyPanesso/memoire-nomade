import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { DatosEmailReserva } from "@/types";

const CARBON = "#1A1A2E";
const GRIS = "#6B7280";
const DORADO_OSCURO = "#A8872D";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

interface PropiedadesNotificacionAdmin {
  datos: DatosEmailReserva;
  urlReserva: string;
}

export function NotificacionAdmin({ datos, urlReserva }: PropiedadesNotificacionAdmin) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Nueva reserva {datos.numero} — {datos.tourNombre}
      </Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <Heading style={{ color: CARBON, fontSize: 18 }}>
            Nueva reserva: {datos.numero}
          </Heading>
          <Text style={{ color: GRIS, fontSize: 14, margin: "4px 0" }}>
            {datos.tourNombre} · {formatoFecha.format(datos.fecha)}
          </Text>

          <Hr />

          <Section>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>Cliente:</strong> {datos.nombreCliente}
            </Text>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>Email:</strong> {datos.emailCliente}
            </Text>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>Teléfono:</strong> {datos.telefonoCliente}
            </Text>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>País:</strong> {datos.paisCliente}
            </Text>
          </Section>

          <Hr />

          <Text style={{ color: CARBON, fontSize: 16, fontWeight: 700, margin: "2px 0" }}>
            Total: {formatoMoneda.format(datos.precioTotal)}
          </Text>
          <Text style={{ color: GRIS, fontSize: 12, margin: "2px 0" }}>
            Referencia Stripe: {datos.stripePaymentIntentId ?? "—"}
          </Text>

          {datos.mensajeCliente ? (
            <>
              <Hr />
              <Text style={{ color: CARBON, fontSize: 14 }}>
                <strong>Mensaje del cliente:</strong> {datos.mensajeCliente}
              </Text>
            </>
          ) : null}

          <Hr />

          <Link href={urlReserva} style={{ color: DORADO_OSCURO, fontSize: 14, fontWeight: 600 }}>
            Ver reserva en el panel →
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

export default NotificacionAdmin;
