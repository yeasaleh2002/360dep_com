import type { ReactNode } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { MobileActionBar, WhatsAppFab } from "@/components/public/whatsapp-button";
import { T } from "@/lib/i18n";
import { Bubbles } from "@/components/ui/bubbles";
import { getServices } from "@/lib/data";
import { JsonLd, businessJsonLd } from "@/lib/seo/jsonld";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const services = await getServices();

  return (
    <>
      <JsonLd data={businessJsonLd(services.map((s) => s.title))} />
      <Bubbles />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-bg"
      >
        <T k="common.skipToContent" />
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {/* Keeps the footer's last line visible above the fixed mobile action bar. */}
      <div aria-hidden className="h-[calc(72px+env(safe-area-inset-bottom))] bg-night lg:hidden" />
      <MobileActionBar />
      <WhatsAppFab />
    </>
  );
}
