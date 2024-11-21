import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // デフォルトの色を追加
        white: colors.white,
        black: colors.black,
        gray: colors.gray,
        blue: colors.blue,
        pink: colors.pink,
        purple: colors.purple,
        // カスタムカラー
        green: {
          one: "#E7F3EF",
          two: "#DDEEE9",
          three: "#C6E2D9",
          four: "#8CC5B3",
          five: "#39705E",
        },
        olive: {
          one: "#E1EAE2",
          two: "#DAE5DB",
          three: "#A5C0A7",
          four: "#729C76",
        },
        cream: {
          one: "#FFFFFF",
          two: "#FEFEFB",
          three: "#FDFCF7",
          four: "#FCFBF4",
        },
        steel: {
          one: "#FAFAFA",
          two: "#F5F5F5",
          three: "#737373",
        },
        leaf: {
          one: "#E0E7A1",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeSlideIn: "fadeSlideIn 0.8s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "spin-reverse": "spin 3s linear infinite reverse",
        "pulse-slow": "pulse 2s infinite",
        "fade-in": "fadeIn 1.5s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
