import { Check } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { Reveal } from "@/components/ui/reveal";
import { T } from "@/lib/i18n";

/** Contact form + "talk to us directly" panel. Used on the home page and on /contact. */
export function ContactBlock({ services }: { services: { id: string; title: string }[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <Reveal>
        <ContactForm services={services} />
      </Reveal>

      <Reveal delay={0.1}>
        <aside className="rounded-3xl bg-night p-8 text-white sm:p-10 lg:sticky lg:top-28">
          <h3 className="text-3xl font-medium !text-white">
            <T k="contact.infoTitle" />
          </h3>
          <p className="mt-4 text-white/70">
            <T k="contact.infoBody" />
          </p>
          <div className="mt-8">
            <WhatsAppButton className="w-full" />
          </div>
          <ul className="mt-10 space-y-4 border-t border-white/10 pt-8 text-sm text-white/70">
            {(["contact.infoPoint1", "contact.infoPoint2", "contact.infoPoint3"] as const).map((key) => (
              <li key={key} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--gold))]" />
                <span>
                  <T k={key} />
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </Reveal>
    </div>
  );
}
