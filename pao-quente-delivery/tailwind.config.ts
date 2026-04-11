import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#faf6f1",
          100: "#f2e9dc",
          200: "#e4d2b8",
          300: "#d1b38a",
          400: "#b88a5a",
          500: "#8b5a2b",
          600: "#6f4420",
          700: "#55321a",
          800: "#3e2412",
          900: "#2a180b",
        },
        cream: "#fff8ef",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
