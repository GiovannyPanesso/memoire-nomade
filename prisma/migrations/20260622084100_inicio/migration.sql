-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "duracion" TEXT NOT NULL,
    "lugaresInteres" TEXT[],
    "incluye" TEXT[],
    "noIncluye" TEXT[],
    "imagenUrl" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas_tour" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "minPersonas" INTEGER,
    "maxPersonas" INTEGER,
    "precio" DECIMAL(10,2) NOT NULL,
    "esNino" BOOLEAN NOT NULL DEFAULT false,
    "edadMaxNino" INTEGER,
    "esOpcional" BOOLEAN NOT NULL DEFAULT false,
    "nombreOpcional" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad_tours" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "motivo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidad_tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "emailCliente" TEXT NOT NULL,
    "telefonoCliente" TEXT NOT NULL,
    "paisCliente" TEXT NOT NULL,
    "numeroAdultos" INTEGER NOT NULL,
    "numeroNinos" INTEGER NOT NULL DEFAULT 0,
    "edadesNinos" INTEGER[],
    "opcionalesSeleccionados" TEXT[],
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "stripePaymentIntentId" TEXT,
    "mensajeCliente" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'Mémoire Nomade',
    "emailContacto" TEXT NOT NULL,
    "telefonoContacto" TEXT NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tours_slug_key" ON "tours"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidad_tours_tourId_fecha_key" ON "disponibilidad_tours"("tourId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_numero_key" ON "reservas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_stripePaymentIntentId_key" ON "reservas"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "tarifas_tour" ADD CONSTRAINT "tarifas_tour_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_tours" ADD CONSTRAINT "disponibilidad_tours_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
