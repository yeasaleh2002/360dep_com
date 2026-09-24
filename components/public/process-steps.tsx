import { CalendarCheck, MessagesSquare, PartyPopper, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { T, type TKey } from "@/lib/i18n";

const STEPS: { title: TKey; body: TKey; icon: typeof MessagesSquare }[] = [
  { title: "about.step1Title", body: "about.step1Body", icon: MessagesSquare },
  { title: "about.step2Title", body: "about.step2Body", icon: CalendarCheck },
  { title: "about.step3Title", body: "about.step3Body", icon: Sparkles },
  { title: "about.step4Title", body: "about.step4Body", icon: PartyPopper },
];

// "How we work" timeline: gradient icons joined by an animated gradient line.
export function ProcessSteps() {
  return (
    <section className="section relative overflow-hidden">
      <div aria-hidden className="blob blob-coral -right-40 top-0" />
      <div className="container relative">
        <SectionHeading eyebrow="about.processEyebrow" title="about.processTitle" />
        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <span aria-hidden className="absolute left-[12%] right-[12%] top-8 hidden h-1 rounded-full bg-energy opacity-60 lg:block" />
          {STEPS.map(({ title, body, icon: Icon }, i) => (
            <Reveal as="li" key={title} delay={i * 0.12} className="relative text-center">
              <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-energy text-white shadow-[0_14px_30px_-10px_rgb(var(--magenta)/0.6)] transition duration-500 hover:rotate-6 hover:scale-110">
                <Icon className="h-7 w-7" />
              </span>
              <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-coral">0{i + 1}</span>
              <h3 className="mt-2 text-xl sm:text-2xl">
                <T k={title} />
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-[0.95rem] text-muted">
                <T k={body} />
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
