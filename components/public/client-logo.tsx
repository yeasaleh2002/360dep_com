import Image from "next/image";
import type { PublicClient } from "@/lib/data";
import { cn } from "@/lib/utils";

/** A client's logo on a light tile, so dark logos stay legible in dark mode too. */
export function ClientLogo({ client, className }: { client: PublicClient; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-24 items-center justify-center rounded-2xl border border-line bg-surface px-6 dark:border-transparent dark:bg-[#f4f1ea]",
        className,
      )}
    >
      <div className="relative h-12 w-full">
        <Image
          src={client.logoUrl}
          alt={client.name}
          fill
          sizes="200px"
          className="object-contain opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
        />
      </div>
    </div>
  );
}

/** Seamless auto-scrolling logo strip; pauses on hover, static when motion is reduced. */
export function ClientsMarquee({ clients }: { clients: PublicClient[] }) {
  if (clients.length < 5) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {clients.map((client) => (
          <div key={client.id} className="group w-44 sm:w-52">
            <ClientLogo client={client} />
          </div>
        ))}
      </div>
    );
  }

  const loop = [...clients, ...clients];
  return (
    <div className="mask-fade-x overflow-hidden">
      <ul
        className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused] sm:gap-6"
        style={{ ["--marquee-duration" as string]: `${Math.max(25, clients.length * 5)}s` }}
      >
        {loop.map((client, i) => (
          <li key={`${client.id}-${i}`} className="group w-44 shrink-0 sm:w-52" aria-hidden={i >= clients.length}>
            <ClientLogo client={client} />
          </li>
        ))}
      </ul>
    </div>
  );
}
