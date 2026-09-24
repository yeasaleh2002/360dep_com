import Link from "next/link";
import { cn } from "@/lib/utils";

/** 360DEP wordmark: an open gold ring (the full circle) beside the name. */
export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "light" }) {
  return (
    <Link
      href="/"
      aria-label="360DEP — Home"
      className={cn("group inline-flex items-center gap-2.5", tone === "light" ? "text-white" : "text-ink", className)}
    >
      <LogoMark className="h-9 w-9 transition-transform duration-700 group-hover:rotate-[360deg]" />
      <span className="flex items-baseline gap-1 leading-none">
        <span className="font-display text-[1.7rem] font-semibold tracking-tight">360</span>
        <span className="text-[0.7rem] font-bold tracking-[0.32em] text-gold-strong dark:text-gold">DEP</span>
      </span>
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <path
        d="M20 4a16 16 0 1 1-15.2 11"
        stroke="rgb(var(--gold))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="4.8" cy="15" r="2.2" fill="rgb(var(--gold))" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  );
}
