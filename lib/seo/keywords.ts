// Bangla + English search phrases, generated per page so no single page carries the whole list.
// Google ignores <meta name="keywords">; the real ranking signals are the area pages' content,
// titles and structured data. These lists mainly help other search engines.
import { AREAS, type Area } from "@/lib/seo/areas";

const BN_SERVICES = [
  "ইভেন্ট ম্যানেজমেন্ট",
  "ইভেন্ট ম্যানেজমেন্ট কোম্পানি",
  "বিয়ের আয়োজন",
  "ওয়েডিং প্ল্যানার",
  "বিয়ের সাজসজ্জা",
  "বিয়ের স্টেজ ডেকোরেশন",
  "গায়ে হলুদের স্টেজ",
  "হলুদ সন্ধ্যা আয়োজন",
  "বৌভাত আয়োজন",
  "রিসেপশন ডেকোরেশন",
  "মঞ্চ সাজসজ্জা",
  "ফুলের সাজসজ্জা",
  "আলোকসজ্জা",
  "ডেকোরেটর",
  "জন্মদিনের পার্টি আয়োজন",
  "কর্পোরেট ইভেন্ট",
  "কনফারেন্স আয়োজন",
  "সেমিনার আয়োজন",
  "আকিকা অনুষ্ঠান আয়োজন",
  "বিবাহবার্ষিকী আয়োজন",
];

const EN_SERVICES = [
  "event management",
  "event management company",
  "event planner",
  "wedding planner",
  "wedding planning",
  "wedding decoration",
  "wedding stage decoration",
  "holud stage decoration",
  "gaye holud decoration",
  "reception decoration",
  "stage decoration",
  "flower decoration",
  "lighting decoration",
  "decorator",
  "birthday party planner",
  "corporate event management",
  "conference management",
  "seminar management",
  "akika program arrangement",
  "anniversary party planner",
];

function areaVariantsEn(area: Area) {
  return [area.en, ...area.enAlt];
}

/** ~100 phrases for one district (Bangla + English). */
export function areaKeywords(area: Area): string[] {
  const list: string[] = [];
  for (const s of BN_SERVICES) {
    list.push(`${area.bn} ${s}`, `${area.bnOf} সেরা ${s}`);
  }
  list.push(
    `${area.bnIn} ইভেন্ট ম্যানেজমেন্ট`,
    `${area.bnIn} বিয়ের আয়োজন`,
    `${area.bnIn} ওয়েডিং প্ল্যানার`,
    `${area.bnOf} সেরা ইভেন্ট ম্যানেজমেন্ট কোম্পানি`,
    `${area.bn} ডেকোরেটর সার্ভিস`,
  );
  for (const place of areaVariantsEn(area)) {
    for (const s of EN_SERVICES.slice(0, place === area.en ? EN_SERVICES.length : 6)) {
      list.push(`${s} in ${place}`, `best ${s} in ${place}`);
    }
  }
  list.push(`event management near ${area.en}`, `wedding planner near ${area.en}`, `${area.en} event management company`);
  for (const u of area.upazilasBn.slice(0, 4)) list.push(`${u} বিয়ের সাজসজ্জা`);
  for (const u of area.upazilasEn.slice(0, 4)) list.push(`event management ${u}`);
  return [...new Set(list)];
}

/** Brand + region-wide phrases for the home page and general pages. */
export function generalKeywords(): string[] {
  return [
    "360DEP",
    "360 DEP",
    "360dep",
    "ইভেন্ট ম্যানেজমেন্ট",
    "ইভেন্ট ম্যানেজমেন্ট কোম্পানি বাংলাদেশ",
    "খুলনা বিভাগের সেরা ইভেন্ট ম্যানেজমেন্ট",
    "যশোরের সেরা ইভেন্ট ম্যানেজমেন্ট কোম্পানি",
    "যশোর ওয়েডিং প্ল্যানার",
    "বিয়ের আয়োজন",
    "বিয়ের সাজসজ্জা",
    "গায়ে হলুদের স্টেজ",
    "কর্পোরেট ইভেন্ট",
    "event management Bangladesh",
    "best event management company in Jashore",
    "best event management company in Khulna division",
    "wedding planner Jashore",
    "wedding planner Jessore",
    "wedding decoration Bangladesh",
    "event management near me",
    "wedding planner near me",
    ...AREAS.map((a) => `${a.bn} ইভেন্ট ম্যানেজমেন্ট`),
    ...AREAS.map((a) => `event management ${a.en}`),
  ];
}

export function totalKeywordCount(): number {
  return new Set([...generalKeywords(), ...AREAS.flatMap(areaKeywords)]).size;
}
