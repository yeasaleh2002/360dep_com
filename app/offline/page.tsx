import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 text-center">
      <LogoMark className="h-14 w-14 text-ink" />
      <WifiOff className="mt-8 h-8 w-8 text-gold" />
      <h1 className="mt-4 text-3xl font-medium">ইন্টারনেট সংযোগ নেই</h1>
      <p className="mt-2 text-muted">You&apos;re offline. Please check your connection and try again.</p>
      <a href="/" className="btn-primary mt-8">
        আবার চেষ্টা করুন · Try again
      </a>
    </main>
  );
}
