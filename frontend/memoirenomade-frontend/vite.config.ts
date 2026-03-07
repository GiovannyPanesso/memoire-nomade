import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Redirige las llamadas /api al backend durante desarrollo
      "/api": {
        target: "http://localhost:5200", // Puerto HTTP de tu API
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
