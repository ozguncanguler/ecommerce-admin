import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        success: "#02A174",
        neutral: "#9E6A55",
        danger: "#C21300",
        "dark-primary": "#3D1811",
        "dark-secondary": "#1B4237",
        "light-primary": "#F2D9B1",
        "light-secondary": "#ABD6CB",

        /*
        dark: "#02133B",
        deep: "#1B4779",
        medium: "#F4AD0F",
        soft: "#4EB6DF",
        pale: "#C4D6E4",
        bright: "#F5E9CA",
        */

        /*
        FULL COLOR PALETTE
        "dark-green": "#002F02",
        "medium-green": "#338D37",
        "soft-green": "#97E29C",
        "dark-blue": "#000E30",
        "medium-blue": "#203D81",
        "soft-blue": "#6A8AD4",
        "dark-red": "#4B001E",
        "medium-red": "#8D2E54",
        "soft-red": "#A77086",
        "dark-yellow": "#4D3600",
        "medium-yellow": "#8C702E",
        "soft-yellow": "#C5B184",
        */
      },
    },
  },
  plugins: [],
};
export default config;
