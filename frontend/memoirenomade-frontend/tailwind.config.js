/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta de colores de Mémoire Nomade
        brand: {
          primary: "#1a1a2e", // Azul noche parisino
          secondary: "#c9a84c", // Dorado
          accent: "#e8f4f8", // Azul claro
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
