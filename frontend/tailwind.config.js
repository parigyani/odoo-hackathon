/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        brand: {
          DEFAULT: "var(--color-brand)",
          light: "var(--color-brand-light)",
          dark: "var(--color-brand-dark)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dark: "var(--color-accent-dark)",
        },
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};
