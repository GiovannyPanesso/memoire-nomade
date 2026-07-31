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
