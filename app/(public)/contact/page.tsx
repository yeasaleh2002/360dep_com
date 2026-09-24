import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { ContactBlock } from "@/components/public/contact-section";
import { getServices } from "@/lib/data";
import bn from "@/lib/i18n/bn.json";

export const metadata: Metadata = {
  title: "যোগাযোগ — যশোরে ইভেন্ট বুকিং | Contact 360DEP",
  description: bn.contact.subtitle,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  // The service dropdown is built from the live, active services (cached under the "services" tag).
  const services = (await getServices()).map(({ id, title }) => ({ id, title }));

  return (
    <>
      <PageHero eyebrow="contact.eyebrow" title="contact.title" subtitle="contact.subtitle" />
      <section className="section">
        <div className="container">
          <ContactBlock services={services} />
        </div>
      </section>
    </>
  );
}
