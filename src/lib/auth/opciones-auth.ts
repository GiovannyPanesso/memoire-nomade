import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/cliente";
import {
  estaBloqueado,
  extraerIpDeCabeceras,
  limpiarIntentosFallidos,
  registrarIntentoFallido,
} from "@/lib/seguridad/limite-tasa";
import { enviarEmailAlertaBloqueoLogin } from "@/lib/emails/enviar-emails";
import { logger } from "@/lib/logger";

const MAX_INTENTOS_LOGIN = 5;
const BLOQUEO_LOGIN_MS = 15 * 60 * 1000;
const DURACION_SESION_SEGUNDOS = 60 * 60 * 8;

export const opcionesAuth: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ip = extraerIpDeCabeceras(req.headers);
        const claveLimite = `login-admin:${credentials.email.toLowerCase()}:${ip}`;

        const bloqueo = await estaBloqueado(claveLimite);
        if (!bloqueo.permitido) {
          logger.error("Login de admin bloqueado por límite de intentos", {
            email: credentials.email,
            ip,
            bloqueadoHasta: bloqueo.bloqueadoHasta,
          });
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        const passwordValida = admin
          ? await bcrypt.compare(credentials.password, admin.passwordHash)
          : false;

        if (!admin || !passwordValida) {
          const resultado = await registrarIntentoFallido(
            claveLimite,
            MAX_INTENTOS_LOGIN,
            BLOQUEO_LOGIN_MS
          );
          // Solo se dispara al activarse el bloqueo (no en cada intento
          // fallido individual), y sin esperar el envío para no retrasar
          // la respuesta del login.
          if (!resultado.permitido && resultado.bloqueadoHasta) {
            void enviarEmailAlertaBloqueoLogin({
              emailIntentado: credentials.email,
              ip,
              bloqueadoHasta: resultado.bloqueadoHasta,
            });
          }
          return null;
        }

        await limpiarIntentosFallidos(claveLimite);

        return {
          id: admin.id,
          email: admin.email,
          name: admin.nombre,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: DURACION_SESION_SEGUNDOS,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
