/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#684F33", dark: "#423526", light: "#8B7355" },
        secondary: { DEFAULT: "#b27632", dark: "#9a6329", light: "#c99150" },
        batik: { cream: "#FAF8F6", beige: "#E5DDD5", brown: "#684F33", dark: "#423526" },
      },
    },
  },
  plugins: [],
};
