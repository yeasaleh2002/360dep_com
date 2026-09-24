"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useLocale, type TKey } from "@/lib/i18n";
import { whatsappLink, whatsappProfileLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  service,
  label = "common.whatsapp",
  className,
  variant = "solid",
}: {
  service?: string;
  label?: TKey;
  className?: string;
  variant?: "solid" | "outline" | "light";
}) {
  const { t } = useLocale();
  const href = service
    ? whatsappLink(t("common.serviceWhatsappMessage", { service }))
    : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? whatsappLink(t("common.generalWhatsappMessage"))
      : whatsappProfileLink();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        variant === "solid" && "btn-whatsapp",
        variant === "outline" &&
          "btn border border-[#1f9d55]/40 text-[#16733e] hover:border-[#1f9d55] hover:bg-[#1f9d55] hover:text-white dark:text-[#4ade80] dark:hover:text-white",
        variant === "light" && "btn bg-white text-night hover:bg-white/90",
        className,
      )}
    >
      <WhatsAppIcon className="h-[18px] w-[18px]" />
      {t(label)}
    </a>
  );
}

function useGeneralWhatsAppLink() {
  const { t } = useLocale();
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? whatsappLink(t("common.generalWhatsappMessage")) : whatsappProfileLink();
}

// Fixed bottom bar on phones and tablets.
export function MobileActionBar() {
  const { t } = useLocale();
  const href = useGeneralWhatsAppLink();

  return (
    <nav
      aria-label={t("common.quickActions")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-3 pt-2.5 shadow-[0_-8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
        <Link href="/services" className="btn min-h-[50px] border border-ink/15 bg-surface text-ink active:scale-[0.98]">
          <LayoutGrid className="h-[18px] w-[18px] text-gold-strong" />
          {t("nav.services")}
        </Link>
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn-whatsapp min-h-[50px] active:scale-[0.98]">
          <WhatsAppIcon className="h-5 w-5" />
          {t("common.whatsappShort")}
        </a>
      </div>
    </nav>
  );
}

// Floating chat bubble on desktop.
export function WhatsAppFab() {
  const { t } = useLocale();
  const href = useGeneralWhatsAppLink();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("common.whatsapp")}
      title={t("common.whatsapp")}
      className="fixed bottom-7 right-7 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#1f9d55] text-white shadow-lift transition hover:scale-105 hover:bg-[#188047] lg:inline-flex"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#1f9d55]/30 [animation-duration:2.8s]" aria-hidden />
      <WhatsAppIcon className="relative h-7 w-7" />
    </a>
  );
}
