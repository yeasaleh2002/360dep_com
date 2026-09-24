"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /** Element to render — use "li" inside lists to keep markup valid. */
  as?: "div" | "li";
};

/**
 * Gentle fade-and-rise when a section scrolls into view (once).
 * Content is server-rendered and visible to crawlers; only the entrance is animated.
 */
export function Reveal({ children, delay = 0, y = 24, as = "div", ...rest }: RevealProps) {
  const Component = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
