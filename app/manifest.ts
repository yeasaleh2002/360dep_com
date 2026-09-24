import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "360DEP — ইভেন্ট ম্যানেজমেন্ট",
    short_name: "360DEP",
    description: "বিয়ে, কর্পোরেট ও বিশেষ আয়োজনের পূর্ণাঙ্গ পরিকল্পনা ও ব্যবস্থাপনা — Event management in Jashore.",
    lang: "bn",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f1",
    theme_color: "#151922",
    categories: ["business", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "সেবাসমূহ · Services", url: "/services" },
      { name: "যোগাযোগ · Contact", url: "/contact" },
      { name: "গ্যালারি · Gallery", url: "/gallery" },
    ],
  };
}
