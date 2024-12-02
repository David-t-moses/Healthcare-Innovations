import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebarBg: "#f4f4f4", // Custom color for sidebar
        primary: "#007bff", // Custom primary color
        textMain: "#333",
      },
    },
  },
  plugins: [],
} satisfies Config;
