import { Sparkle } from "lucide-react";

const FALLBACK = ["বিয়ে", "গায়ে হলুদ", "বৌভাত", "কর্পোরেট ইভেন্ট", "জন্মদিন", "মঞ্চ সাজসজ্জা", "Wedding", "Corporate", "Birthday"];

// Colourful running strip of service names between the hero and the first section.
export function EnergyRibbon({ items }: { items: string[] }) {
  const words = items.length >= 3 ? items : FALLBACK;
  const loop = [...words, ...words, ...words, ...words];

  return (
    <div aria-hidden className="relative z-10 -mt-6 -rotate-1 overflow-hidden bg-energy py-3.5 shadow-lift sm:-mt-8">
      <ul className="flex w-max animate-marquee items-center gap-6 whitespace-nowrap [--marquee-duration:45s]">
        {[...loop, ...loop].map((word, i) => (
          <li key={i} className="flex items-center gap-6 font-display text-lg font-bold text-white sm:text-xl">
            {word}
            <Sparkle className="h-4 w-4 fill-white/80 text-white/80" />
          </li>
        ))}
      </ul>
    </div>
  );
}
