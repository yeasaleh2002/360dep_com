// Bilingual copy for the district pages. Both languages are rendered in the HTML so each
// district page ranks for Bangla and English searches.
import type { Area } from "@/lib/seo/areas";

export function areaContent(area: Area) {
  const upBn = area.upazilasBn.join(", ");
  const upEn = area.upazilasEn.join(", ");

  return {
    titleBn: `${area.bnIn} ইভেন্ট ম্যানেজমেন্ট ও বিয়ের আয়োজন`,
    titleEn: `Event management & wedding planning in ${area.en}`,
    metaTitle: `${area.bn} ইভেন্ট ম্যানেজমেন্ট ও ওয়েডিং প্ল্যানার | Best Event Management in ${area.en}`,
    metaDescription: `${area.bnIn} বিয়ে, গায়ে হলুদ, বৌভাত, জন্মদিন ও কর্পোরেট অনুষ্ঠানের পূর্ণাঙ্গ আয়োজন ও সাজসজ্জা — 360DEP. Event management, wedding planning and stage decoration in ${area.en}.`,
    introBn: `${area.bnOf} যেকোনো এলাকায় — ${upBn} — বিয়ে, গায়ে হলুদ, বৌভাত, জন্মদিন কিংবা কর্পোরেট অনুষ্ঠানের পরিকল্পনা, মঞ্চ ও ফুলের সাজসজ্জা, আলোকসজ্জা এবং অনুষ্ঠানের দিনের পুরো ব্যবস্থাপনা করে 360DEP। একজন নির্দিষ্ট সমন্বয়ক শুরু থেকে শেষ পর্যন্ত আপনার অনুষ্ঠানের দায়িত্বে থাকেন।`,
    introEn: `Across ${area.en} — ${upEn} — 360DEP plans and runs weddings, gaye holud, receptions, birthdays and corporate events: planning, stage and flower decoration, lighting and full management on the day, with one dedicated coordinator from start to finish.`,
    handles: [
      ["বিয়ে, গায়ে হলুদ ও বৌভাতের পূর্ণাঙ্গ আয়োজন", "Complete wedding, gaye holud and reception planning"],
      ["থিম-ভিত্তিক মঞ্চ, ফুল ও আলোকসজ্জা", "Themed stage, flower and lighting decoration"],
      ["জন্মদিন, আকিকা ও পারিবারিক অনুষ্ঠান", "Birthdays, akika and family events"],
      ["কনফারেন্স, সেমিনার ও কর্পোরেট ইভেন্ট", "Conferences, seminars and corporate events"],
      ["ভেন্যু, ক্যাটারিং ও ভেন্ডর সমন্বয়", "Venue, catering and vendor coordination"],
      ["অনুষ্ঠানের দিন মাঠে থেকে পুরো ব্যবস্থাপনা", "On-site management on the day"],
    ] as const,
    faqs: [
      {
        q: `${area.bnIn} কি আপনারা অনুষ্ঠান আয়োজন করেন? / Do you work in ${area.en}?`,
        a: `হ্যাঁ। ${area.bnOf} সদর উপজেলাসহ সব উপজেলায় আমরা বিয়ে, হলুদ, জন্মদিন ও কর্পোরেট অনুষ্ঠান আয়োজন করি। Yes — we plan and manage events across every upazila of ${area.en}.`,
      },
      {
        q: `${area.bnIn} বিয়ের সাজসজ্জার খরচ কত? / How much does wedding decoration cost in ${area.en}?`,
        a: `খরচ নির্ভর করে অতিথির সংখ্যা, ভেন্যু আর সাজসজ্জার ধরনের ওপর। তারিখ ও চাহিদা জানালে আমরা বিস্তারিত বাজেট দিই। It depends on guest count, venue and décor style — share your date and needs and we'll send a detailed quote.`,
      },
      {
        q: `কীভাবে বুকিং দেব? / How do I book?`,
        a: `ওয়েবসাইটের ফর্ম পূরণ করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন। Fill in the contact form or message us on WhatsApp.`,
      },
    ],
  };
}
