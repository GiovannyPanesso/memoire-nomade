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

interface TarifaSeed {
  minPersonas?: number;
  maxPersonas?: number;
  precio: number;
  esNino?: boolean;
  edadMaxNino?: number;
  esOpcional?: boolean;
  nombreOpcional?: string;
}

interface TourSeed {
  slug: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  lugaresInteres: string[];
  incluye: string[];
  noIncluye: string[];
  imagenUrl: string;
  tarifas: TarifaSeed[];
}

// Catálogo actual de Mémoire Nomade. Precios e imágenes son ilustrativos;
// ajustar a las tarifas reales del negocio antes de usar en producción.
const TOURS_INICIALES: TourSeed[] = [
  {
    slug: "lo-esencial-de-paris",
    nombre: "Lo Esencial de París",
    descripcion:
      "Un recorrido de día completo por los monumentos más emblemáticos de París: la Torre Eiffel, el Arco del Triunfo, los Campos Elíseos y la Catedral de Notre-Dame. Ideal para quienes visitan la ciudad por primera vez.",
    duracion: "8 horas",
    lugaresInteres: [
      "Torre Eiffel",
      "Arco del Triunfo",
      "Campos Elíseos",
      "Catedral de Notre-Dame",
      "Museo del Louvre (exterior)",
    ],
    incluye: [
      "Guía profesional en español",
      "Transporte en minivan climatizada",
      "Agua embotellada",
    ],
    noIncluye: ["Entradas a monumentos", "Comidas", "Propinas"],
    imagenUrl: "https://images.memoirenomade.com/tours/lo-esencial-de-paris.jpg",
    tarifas: [
      { minPersonas: 1, maxPersonas: 2, precio: 95 },
      { minPersonas: 3, maxPersonas: 5, precio: 80 },
      { minPersonas: 6, maxPersonas: 12, precio: 65 },
      { esNino: true, edadMaxNino: 11, precio: 45 },
      { esOpcional: true, nombreOpcional: "Entrada prioritaria al Museo del Louvre", precio: 22 },
    ],
  },
  {
    slug: "montmartre-y-el-espiritu-bohemio",
    nombre: "Montmartre y el Espíritu Bohemio",
    descripcion:
      "Paseo por las callejuelas empedradas de Montmartre, cuna de artistas como Picasso y Toulouse-Lautrec. Visitamos la Basílica del Sacré-Cœur, la Place du Tertre y el icónico Muro de los Te Amo.",
    duracion: "4 horas",
    lugaresInteres: [
      "Basílica del Sacré-Cœur",
      "Place du Tertre",
      "Moulin Rouge (exterior)",
      "Muro de los Te Amo",
    ],
    incluye: ["Guía profesional en español", "Caminata guiada"],
    noIncluye: ["Transporte", "Entradas a museos", "Comidas"],
    imagenUrl:
      "https://images.memoirenomade.com/tours/montmartre-y-el-espiritu-bohemio.jpg",
    tarifas: [
      { minPersonas: 1, maxPersonas: 2, precio: 55 },
      { minPersonas: 3, maxPersonas: 5, precio: 45 },
      { minPersonas: 6, maxPersonas: 12, precio: 35 },
      { esNino: true, edadMaxNino: 11, precio: 25 },
      { esOpcional: true, nombreOpcional: "Visita a un atelier de artista local", precio: 15 },
    ],
  },
  {
    slug: "versalles-palacio-y-jardines",
    nombre: "Versalles: Palacio y Jardines",
    descripcion:
      "Una jornada completa en el Palacio de Versalles, antigua residencia real. Recorremos la Galería de los Espejos, los Salones Reales y los magníficos jardines diseñados por André Le Nôtre.",
    duracion: "Día completo",
    lugaresInteres: [
      "Palacio de Versalles",
      "Galería de los Espejos",
      "Jardines de Versalles",
      "Gran Canal",
    ],
    incluye: [
      "Guía profesional en español",
      "Transporte ida y vuelta desde París",
      "Auriculares individuales",
    ],
    noIncluye: ["Entrada al Palacio de Versalles", "Comidas", "Propinas"],
    imagenUrl:
      "https://images.memoirenomade.com/tours/versalles-palacio-y-jardines.jpg",
    tarifas: [
      { minPersonas: 1, maxPersonas: 2, precio: 110 },
      { minPersonas: 3, maxPersonas: 5, precio: 95 },
      { minPersonas: 6, maxPersonas: 12, precio: 80 },
      { esNino: true, edadMaxNino: 11, precio: 55 },
      { esOpcional: true, nombreOpcional: "Bosquecillos Musicales (temporada)", precio: 12 },
      { esOpcional: true, nombreOpcional: "Trianon y Aldea de la Reina", precio: 18 },
    ],
  },
  {
    slug: "crucero-y-barrio-latino",
    nombre: "Crucero y Barrio Latino",
    descripcion:
      "Descubrimos la Isla de la Cité con Notre-Dame y la Sainte-Chapelle, y paseamos por el animado Barrio Latino. Termina con la opción de un crucero por el Sena al atardecer.",
    duracion: "3 horas",
    lugaresInteres: [
      "Catedral de Notre-Dame",
      "Sainte-Chapelle",
      "Barrio Latino",
      "Río Sena",
    ],
    incluye: ["Guía profesional en español", "Caminata guiada"],
    noIncluye: ["Crucero por el Sena (opcional)", "Entradas a monumentos", "Comidas"],
    imagenUrl: "https://images.memoirenomade.com/tours/crucero-y-barrio-latino.jpg",
    tarifas: [
      { minPersonas: 1, maxPersonas: 2, precio: 48 },
      { minPersonas: 3, maxPersonas: 5, precio: 40 },
      { minPersonas: 6, maxPersonas: 12, precio: 32 },
      { esNino: true, edadMaxNino: 11, precio: 22 },
      { esOpcional: true, nombreOpcional: "Crucero por el Sena", precio: 18 },
    ],
  },
  {
    slug: "paris-de-noche-luces-y-cabaret",
    nombre: "París de Noche: Luces y Cabaret",
    descripcion:
      "Vivimos la magia de París al anochecer: la Torre Eiffel iluminada, el Trocadéro y un paseo en bateau-mouche por el Sena. Termina la velada con la opción de un espectáculo de cabaret.",
    duracion: "5 horas",
    lugaresInteres: ["Torre Eiffel (iluminada)", "Trocadéro", "Río Sena"],
    incluye: [
      "Guía profesional en español",
      "Transporte en minivan climatizada",
      "Paseo en bateau-mouche",
    ],
    noIncluye: ["Entrada al cabaret (opcional)", "Cena (opcional)", "Propinas"],
    imagenUrl:
      "https://images.memoirenomade.com/tours/paris-de-noche-luces-y-cabaret.jpg",
    tarifas: [
      { minPersonas: 1, maxPersonas: 2, precio: 75 },
      { minPersonas: 3, maxPersonas: 5, precio: 65 },
      { minPersonas: 6, maxPersonas: 12, precio: 55 },
      { esNino: true, edadMaxNino: 11, precio: 38 },
      { esOpcional: true, nombreOpcional: "Entrada al cabaret Moulin Rouge (show nocturno)", precio: 90 },
      { esOpcional: true, nombreOpcional: "Cena a bordo del bateau-mouche", precio: 65 },
    ],
  },
];

async function crearToursIniciales() {
  for (const tourSeed of TOURS_INICIALES) {
    const existente = await prisma.tour.findUnique({
      where: { slug: tourSeed.slug },
    });

    if (existente) {
      console.log(`Tour ya existe: ${tourSeed.nombre}`);
      continue;
    }

    await prisma.tour.create({
      data: {
        slug: tourSeed.slug,
        nombre: tourSeed.nombre,
        descripcion: tourSeed.descripcion,
        duracion: tourSeed.duracion,
        lugaresInteres: tourSeed.lugaresInteres,
        incluye: tourSeed.incluye,
        noIncluye: tourSeed.noIncluye,
        imagenUrl: tourSeed.imagenUrl,
        tarifas: {
          create: tourSeed.tarifas.map((tarifa) => ({
            minPersonas: tarifa.minPersonas,
            maxPersonas: tarifa.maxPersonas,
            precio: tarifa.precio,
            esNino: tarifa.esNino ?? false,
            edadMaxNino: tarifa.edadMaxNino,
            esOpcional: tarifa.esOpcional ?? false,
            nombreOpcional: tarifa.nombreOpcional,
          })),
        },
      },
    });

    console.log(`Tour creado: ${tourSeed.nombre}`);
  }
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

  // Crear catálogo inicial de tours con sus tarifas
  await crearToursIniciales();

  // Crear configuración inicial del negocio
  const imagenesSitio = {
    logoUrl:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782202880/3af44338-47ce-4e33-a2d9-176516247b59_zpg28x.jpg",
    imagenCabecera:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782203997/foto_hero_paris_mibqeq.jpg",
    imagenSeccion1:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782203988/piramide-louvre_fwnrel.jpg",
    imagenSeccion2:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782203979/Sacr%C3%A9-C%C5%93ur_dthr7x.jpg",
    imagenSeccion3:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782203974/notre_dame_sfouj4.jpg",
    imagenGaleria1:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782203965/moulin_rouge_tjnriv.jpg",
    imagenGaleria2:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782202874/d24f0ef2-db78-4491-8019-211f1124979a_bugnlt.jpg",
    imagenGaleria3:
      "https://res.cloudinary.com/krwc8af8/image/upload/v1782202877/56011bbe-ef52-4fff-823c-5b63e5b6c0ea_lej8k3.jpg",
  };

  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: imagenesSitio,
    create: {
      id: "singleton",
      nombreNegocio: "Mémoire Nomade",
      emailContacto: adminEmail1,
      telefonoContacto: "+33 6 00 00 00 00",
      ...imagenesSitio,
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
