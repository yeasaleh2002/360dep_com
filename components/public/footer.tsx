import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { T } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { NAV_ITEMS } from "@/lib/nav";
import { AREAS } from "@/lib/seo/areas";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-night text-white/70">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full border border-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full border border-[rgb(var(--gold)/0.15)]"
      />

      <div className="container relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:py-20">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-6 text-[0.95rem] leading-relaxed">
            <T k="footer.about" />
          </p>
        </div>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--gold))]">
            <T k="footer.explore" />
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  <T k={item.key} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--gold))]">
            <T k="footer.getInTouch" />
          </h2>
          <p className="mt-6 text-[0.95rem] leading-relaxed">
            <T k="footer.getInTouchBody" />
          </p>
          <div className="mt-6">
            <WhatsAppButton />
          </div>
        </div>
      </div>

      <div className="container relative border-t border-white/10 py-8">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--gold))]">
          সেবা এলাকা · Service areas
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {AREAS.map((a) => (
            <li key={a.slug}>
              <Link href={`/areas/${a.slug}`} className="transition hover:text-white">
                {a.bnIn} ইভেন্ট ম্যানেজমেন্ট
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            © {year} 360DEP. <T k="footer.rights" />
          </p>
          <p>360dep.com</p>
        </div>
      </div>
    </footer>
  );
}
