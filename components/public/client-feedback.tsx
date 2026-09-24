import Image from "next/image";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { PublicClient } from "@/lib/data";

export function ClientFeedback({ clients, limit }: { clients: PublicClient[]; limit?: number }) {
  const withFeedback = clients.filter((c) => c.feedback).slice(0, limit);
  if (withFeedback.length === 0) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {withFeedback.map((client, i) => (
        <Reveal as="div" key={client.id} delay={(i % 3) * 0.08} className="card flex h-full flex-col p-7 sm:p-8">
          <Quote className="h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden />
          <blockquote className="mt-4 flex-1 whitespace-pre-line text-[0.97rem] leading-relaxed text-ink/90">
            {client.feedback}
          </blockquote>
          <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            <div className="relative h-10 w-16 shrink-0 rounded-lg bg-white">
              <Image src={client.logoUrl} alt="" fill sizes="64px" className="object-contain p-1" />
            </div>
            <p className="font-semibold">{client.name}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
