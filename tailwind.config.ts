import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f1e6",
        ink: "#223126",
        sage: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        moss: {
          50: "#f3f8f2",
          100: "#dfeadd",
          200: "#bfd4bc",
          300: "#9cba98",
          400: "#789d75",
          500: "#5f845c",
          600: "#4b6a49",
          700: "#3b5439",
          800: "#2e412d",
          900: "#223024",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        sm: "0 4px 20px rgba(0,0,0,0.03)",
        soft: "0 20px 60px rgba(60, 84, 61, 0.14)",
        float: "0 18px 44px rgba(46, 65, 45, 0.12)",
      },
      borderRadius: {
        panel: "28px",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        mist: "radial-gradient(circle at top left, rgba(255,255,255,0.95) 0, rgba(255,255,255,0.35) 35%, transparent 60%), linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(255,255,255,0.85), rgba(16, 185, 129, 0.15))",
      },
    },
  },
  plugins: [],
};

export default config;
