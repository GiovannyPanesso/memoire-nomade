import type { NextConfig } from "next";

const RUTAS_PDF_WORKER = [
  "./src/lib/pdf/**",
  "./node_modules/@react-pdf/**",
  "./node_modules/tsx/**",
];

const nextConfig: NextConfig = {
  // El PDF de la reserva se genera en un proceso Node aparte (ver
  // src/lib/pdf/generar-pdf-reserva.ts) para evitar un conflicto de dos
  // copias de React entre el bundle de la ruta y el reconciler de
  // @react-pdf/renderer. Como ese proceso se invoca por ruta de archivo
  // (child_process), el trazador de Next no lo detecta solo: hay que
  // incluirlo a mano para que no falte en el deploy de Vercel.
  outputFileTracingIncludes: {
    "/api/reservas/pdf": RUTAS_PDF_WORKER,
    "/api/webhooks/stripe": RUTAS_PDF_WORKER,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.memoirenomade.com",
      },
    ],
  },
};

export default nextConfig;
