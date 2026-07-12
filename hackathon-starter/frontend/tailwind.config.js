/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Locked palette — use ONLY these across the whole app so the UI
        // stays consistent no matter who on the team builds which screen.
        ink: "#1D2233",       // primary text
        canvas: "#FBFBFD",    // page background
        surface: "#F1F3F8",   // card/panel background
        border: "#E1E4EC",    // dividers, input borders
        brand: {
          DEFAULT: "#35407A", // primary actions, links, headers
          light: "#4E5B9E",
          dark: "#242C58",
        },
        accent: {
          DEFAULT: "#F2B134", // highlights, badges, CTAs — use sparingly
          dark: "#C98F1D",
        },
        danger: "#D64545",
        success: "#2E9E5B",
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
