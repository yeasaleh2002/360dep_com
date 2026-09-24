import { Cormorant_Garamond, Hind_Siliguri, Manrope, Noto_Serif_Bengali } from "next/font/google";

export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const sansFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: false,
});

export const bnSansFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bn-sans",
});

export const bnDisplayFont = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-bn-display",
});

export const fontVariables = [displayFont.variable, sansFont.variable, bnSansFont.variable, bnDisplayFont.variable].join(" ");
