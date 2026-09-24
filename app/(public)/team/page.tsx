import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { TeamCard } from "@/components/public/team-card";
import { CtaSection } from "@/components/public/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { T } from "@/lib/i18n";
import { getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "আমাদের দল | Our Team — 360DEP Event Management",
  description: "360DEP-এর পরিকল্পনাকারী, ডিজাইনার আর মাঠের কর্মীদের সাথে পরিচিত হোন। Meet the planners, designers and crew behind 360DEP.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <PageHero eyebrow="home.teamEyebrow" title="home.teamTitle" subtitle="home.teamSubtitle" />
      <section className="section">
        <div className="container">
          {team.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {team.map((member, i) => (
                <Reveal key={member.id} delay={(i % 4) * 0.08}>
                  <TeamCard member={member} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">
              <T k="team.empty" />
            </p>
          )}
        </div>
      </section>
      <CtaSection />
    </>
  );
}
