import { AREAS, type Area } from "@/lib/seo/areas";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://360dep.com";

function phone() {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits ? `+${digits}` : undefined;
}

export function businessJsonLd(serviceNames: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "360DEP",
    alternateName: ["360 DEP", "360DEP Event Management"],
    description:
      "Event management, wedding planning and decoration in Jashore and across the Khulna division — যশোর ও খুলনা বিভাগে বিয়ে, গায়ে হলুদ, কর্পোরেট ও সব ধরনের অনুষ্ঠানের আয়োজন।",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    telephone: phone(),
    address: { "@type": "PostalAddress", addressLocality: "Jashore", addressRegion: "Khulna", addressCountry: "BD" },
    areaServed: AREAS.map((a) => ({ "@type": "AdministrativeArea", name: `${a.en} District`, alternateName: a.bn })),
    knowsLanguage: ["bn", "en"],
    ...(serviceNames.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services",
            itemListElement: serviceNames.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
          },
        }
      : {}),
  };
}

export function areaJsonLd(area: Area, faqs: { q: string; a: string }[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Event management & wedding planning in ${area.en}`,
      alternateName: `${area.bnIn} ইভেন্ট ম্যানেজমেন্ট ও বিয়ের আয়োজন`,
      serviceType: "Event management",
      provider: { "@id": `${SITE_URL}/#business` },
      areaServed: { "@type": "AdministrativeArea", name: `${area.en} District`, alternateName: area.bn },
      url: `${SITE_URL}/areas/${area.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Service areas", item: `${SITE_URL}/areas` },
        { "@type": "ListItem", position: 3, name: area.en, item: `${SITE_URL}/areas/${area.slug}` },
      ],
    },
  ];
}

// `<` is escaped so text entered in the admin panel can never close the script tag.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
