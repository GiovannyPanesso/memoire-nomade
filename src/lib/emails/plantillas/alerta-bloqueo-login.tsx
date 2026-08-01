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

const CARBON = "#1A1A2E";
const GRIS = "#6B7280";
const ROJO = "#B91C1C";

const formatoFechaHora = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

interface PropiedadesAlertaBloqueoLogin {
  emailIntentado: string;
  ip: string;
  bloqueadoHasta: Date;
}

export function AlertaBloqueoLogin({
  emailIntentado,
  ip,
  bloqueadoHasta,
}: PropiedadesAlertaBloqueoLogin) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Acceso al panel de admin bloqueado por intentos fallidos</Preview>
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
          <Heading style={{ color: ROJO, fontSize: 18 }}>
            Bloqueo de acceso al panel de administración
          </Heading>
          <Text style={{ color: GRIS, fontSize: 14, margin: "4px 0" }}>
            Se detectaron 5 intentos fallidos consecutivos de inicio de sesión y el
            acceso quedó bloqueado temporalmente.
          </Text>

          <Hr />

          <Section>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>Email usado en el intento:</strong> {emailIntentado}
            </Text>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>IP:</strong> {ip}
            </Text>
            <Text style={{ color: CARBON, fontSize: 14, margin: "2px 0" }}>
              <strong>Bloqueado hasta:</strong> {formatoFechaHora.format(bloqueadoHasta)}
            </Text>
          </Section>

          <Hr />

          <Text style={{ color: GRIS, fontSize: 12, margin: "2px 0" }}>
            Si fuiste tú intentando entrar, simplemente espera a que expire el
            bloqueo. Si no reconoces este intento, es posible que alguien esté
            probando acceder a tu panel de administración.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AlertaBloqueoLogin;
