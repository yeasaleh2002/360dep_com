import Image from "next/image";
import { LogoMark } from "@/components/ui/logo";
import { PriceRange } from "@/components/public/price-range";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import type { PublicService } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, full = false }: { service: PublicService; full?: boolean }) {
  return (
    <article id={service.slug} className="card group flex h-full scroll-mt-28 flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            <LogoMark className="h-16 w-16" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-[1.6rem] font-medium">{service.title}</h3>
        <p className={cn("mt-3 whitespace-pre-line text-[0.95rem] text-muted", !full && "line-clamp-4")}>
          {service.description}
        </p>
        <PriceRange min={service.priceMin} max={service.priceMax} />
        <div className="mt-auto pt-6">
          <WhatsAppButton service={service.title} label="common.messageOnWhatsapp" variant="outline" className="w-full" />
        </div>
      </div>
    </article>
  );
}
