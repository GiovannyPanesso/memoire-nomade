import type { NextConfig } from "next";

// Dependencias no-scoped de @react-pdf/renderer y @react-pdf/font (fuera del
// glob "@react-pdf/**") resueltas recorriendo el árbol de dependencias real
// instalado en node_modules — no basta con las directas, hay que arrastrar
// también las transitivas (p. ej. fontkit → restructure, unicode-trie, etc.).
const DEPENDENCIAS_REACT_PDF_NO_SCOPED = [
  "@babel/runtime",
  "@noble/ciphers",
  "@noble/hashes",
  "@swc/helpers",
  "abs-svg-path",
  "base64-js",
  "bidi-js",
  "brotli",
  "browserify-zlib",
  "clone",
  "color-name",
  "color-string",
  "dfa",
  "emoji-regex-xs",
  "events",
  "fast-deep-equal",
  "fflate",
  "fontkit",
  "hsl-to-hex",
  "hsl-to-rgb-for-reals",
  "hyphen",
  "inherits",
  "is-url",
  "jay-peg",
  "js-md5",
  "js-tokens",
  "linebreak",
  "loose-envify",
  "media-engine",
  "normalize-svg-path",
  "object-assign",
  "pako",
  "parse-svg-path",
  "png-js",
  "postcss-value-parser",
  "prop-types",
  "queue",
  "react-is",
  "require-from-string",
  "restructure",
  "safe-buffer",
  "scheduler",
  "string_decoder",
  "svg-arc-to-cubic-bezier",
  "tiny-inflate",
  "tslib",
  "unicode-properties",
  "unicode-trie",
  "util-deprecate",
  "vite-compatible-readable-stream",
  "yoga-layout",
];

const RUTAS_PDF_WORKER = [
  "./src/lib/pdf/**",
  "./node_modules/@react-pdf/**",
  ...DEPENDENCIAS_REACT_PDF_NO_SCOPED.map((paquete) => `./node_modules/${paquete}/**`),
  "./node_modules/tsx/**",
  // tsx transforma TypeScript en tiempo de ejecución usando esbuild, pero
  // esbuild queda hoisteado en su propia carpeta de node_modules (no dentro
  // de node_modules/tsx). Sin esto, el proceso hijo falla en Vercel con
  // "Cannot find package 'esbuild'".
  "./node_modules/esbuild/**",
  "./node_modules/@esbuild/**",
];

// Fase de despliegue de la CSP: empezar en modo "Report-Only" (solo reporta
// violaciones en la consola del navegador, no bloquea nada) para verificar
// que Stripe Elements y el widget de subida de Cloudinary siguen funcionando
// antes de pasar a modo bloqueante. Ver auditoría de seguridad 2026-07-31, §6.
const CSP_EN_MODO_BLOQUEANTE = false;

const DIRECTIVAS_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://upload-widget.cloudinary.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://upload-widget.cloudinary.com",
  "connect-src 'self' https://api.stripe.com https://api.cloudinary.com https://upload-widget.cloudinary.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://images.memoirenomade.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
].join("; ");

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: CSP_EN_MODO_BLOQUEANTE
              ? "Content-Security-Policy"
              : "Content-Security-Policy-Report-Only",
            value: DIRECTIVAS_CSP,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
