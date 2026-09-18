/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        batik: {
          dark: "#0B301D",      // Deep Forest Green
          green: "#144229",     // Emerald Green
          gold: "#D4AF37",      // Classic Metallic Gold
          warm: "#C5A059",      // Warm Gold
          olive: "#7A6B39",     // Olive Tint
          bronze: "#4A4523",    // Bronze Shadow
          cream: "#FAF8F6",
          beige: "#E5DDD5"
        },
      },
    },
  },
  plugins: [],
};
