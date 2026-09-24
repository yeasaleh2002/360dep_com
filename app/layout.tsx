import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { fontVariables } from "./fonts";
import { Providers } from "@/components/providers";
import { Clarity } from "@/components/clarity";
import { generalKeywords } from "@/lib/seo/keywords";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://360dep.com";

const SEO_TITLE = "360DEP — যশোরের ইভেন্ট ম্যানেজমেন্ট ও ওয়েডিং প্ল্যানার | Best Event Management in Jashore";
const SEO_DESCRIPTION =
  "যশোর, ঝিনাইদহ, মাগুরা, সাতক্ষীরা, খুলনাসহ পুরো খুলনা বিভাগে বিয়ে, গায়ে হলুদ, জন্মদিন ও কর্পোরেট অনুষ্ঠানের পূর্ণাঙ্গ আয়োজন ও সাজসজ্জা। Event management, wedding planning and decoration in Jashore and the Khulna division.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SEO_TITLE, template: "%s — 360DEP" },
  description: SEO_DESCRIPTION,
  keywords: generalKeywords(),
  applicationName: "360DEP",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "360DEP",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: siteUrl,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SEO_TITLE, description: SEO_DESCRIPTION },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "360DEP", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes sets the class and the locale may switch lang before hydration.
    <html lang="bn" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://wsrv.nl" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://wsrv.nl" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Clarity />
      </body>
    </html>
  );
}
