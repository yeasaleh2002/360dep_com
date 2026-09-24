import { Anek_Bangla, Baloo_Da_2, Plus_Jakarta_Sans, Sora } from "next/font/google";

// Headings: Sora (Latin) + Baloo Da 2 (Bangla). Body: Plus Jakarta Sans (Latin) + Anek Bangla (Bangla).
// Each CSS stack lists Latin first, then Bangla, so each script gets its own face.
export const displayFont = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: false,
});

export const bnDisplayFont = Baloo_Da_2({
  subsets: ["bengali"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-bn-display",
});

export const bnSansFont = Anek_Bangla({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-bn-sans",
});

export const fontVariables = [displayFont.variable, sansFont.variable, bnSansFont.variable, bnDisplayFont.variable].join(" ");
