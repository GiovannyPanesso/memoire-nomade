import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function obtenerVariableEntorno(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno "${nombre}". Defínela en .env antes de ejecutar el seed.`
    );
  }
  return valor;
}

async function main() {
  console.log("Iniciando seed...");

  const adminEmail1 = obtenerVariableEntorno("ADMIN_EMAIL_1");
  const adminPassword = obtenerVariableEntorno("ADMIN_PASSWORD");

  // Crear admins iniciales
  const admins = [
    {
      email: adminEmail1,
      nombre: "Administrador Principal",
      password: adminPassword,
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
      emailContacto: adminEmail1,
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
