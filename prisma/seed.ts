import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Crear admins iniciales
  // IMPORTANTE: Cambia estas credenciales antes de ejecutar en producción
  const admins = [
    {
      email: process.env.ADMIN_EMAIL_1 ?? "admin@memoirenomade.com",
      nombre: "Administrador Principal",
      password: "CambiarEstaContrasena2024!",
    },
  ];

  for (const adminData of admins) {
    const existe = await prisma.admin.findUnique({
      where: { email: adminData.email },
    });

    if (!existe) {
      const passwordHash = await bcrypt.hash(adminData.password, 12);
      await prisma.admin.create({
        data: {
          email: adminData.email,
          nombre: adminData.nombre,
          passwordHash,
        },
      });
      console.log(`Admin creado: ${adminData.email}`);
    } else {
      console.log(`Admin ya existe: ${adminData.email}`);
    }
  }

  // Crear configuración inicial del negocio
  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nombreNegocio: "Mémoire Nomade",
      emailContacto: process.env.ADMIN_EMAIL_1 ?? "admin@memoirenomade.com",
      telefonoContacto: "+33 6 00 00 00 00",
    },
  });
  console.log("Configuración inicial creada");

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
