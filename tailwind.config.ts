import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        reddit: ["Reddit Sans", "sans-serif"],
        rubik: ["Rubik", "serif"],
      },

      fontWeight: {
        light: "200",
        normal: "250",
        bold: "700",
        extrabold: "900",
      },
      backgroundImage: {
        "dark-gradient":
          "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
      },
      keyframes: {
        pulseOnce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
