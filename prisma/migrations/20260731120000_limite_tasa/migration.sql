-- CreateTable
-- Tabla de rate limiting: contador de intentos de login de admin y de
-- peticiones a endpoints públicos sensibles (ver src/lib/seguridad/limite-tasa.ts)
CREATE TABLE "limites_tasa" (
    "clave" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 1,
    "bloqueadoHasta" TIMESTAMP(3),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "limites_tasa_pkey" PRIMARY KEY ("clave")
);
