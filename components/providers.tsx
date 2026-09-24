"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Light mode is the default; the visitor's choice persists in localStorage.
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <LocaleProvider>
        {/* Honour the OS "reduce motion" setting for every animation. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LocaleProvider>
    </ThemeProvider>
  );
}
