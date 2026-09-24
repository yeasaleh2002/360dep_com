import type { Config } from "tailwindcss";

// Colors are CSS variables (see app/globals.css) so light and dark themes are each
// designed deliberately rather than inverted.
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        bg: withAlpha("--bg"),
        surface: withAlpha("--surface"),
        "surface-2": withAlpha("--surface-2"),
        ink: withAlpha("--ink"),
        muted: withAlpha("--muted"),
        line: withAlpha("--line"),
        gold: withAlpha("--gold"),
        "gold-strong": withAlpha("--gold-strong"),
        night: withAlpha("--night"),
        coral: withAlpha("--coral"),
        magenta: withAlpha("--magenta"),
        violet: withAlpha("--violet"),
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-bn-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-bn-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em" },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.08)",
        lift: "0 2px 4px rgb(0 0 0 / 0.04), 0 24px 48px -16px rgb(0 0 0 / 0.18)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rise: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "float-y": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-y": "float-y 6s ease-in-out infinite",
        "spin-slow": "spin-slow 24s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
