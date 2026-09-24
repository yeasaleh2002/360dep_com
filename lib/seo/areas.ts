// All 64 districts of Bangladesh, each with a page at /areas/<slug>.
// CORE_AREAS (Khulna division, where 360DEP works most) are listed first everywhere.
export type Area = {
  slug: string;
  en: string;
  /** Other English spellings people search with. */
  enAlt: string[];
  bn: string;
  /** Locative form, e.g. "যশোরে". */
  bnIn: string;
  /** Genitive form, e.g. "যশোরের". */
  bnOf: string;
  upazilasBn: string[];
  upazilasEn: string[];
  division: Division;
  /** Core service area — shown first on the home page, footer and /areas. */
  core: boolean;
};

export const HOME_AREA_SLUG = "jashore";

const CORE_AREAS: Area[] = ([
  {
    slug: "jashore",
    en: "Jashore",
    enAlt: ["Jessore"],
    bn: "যশোর",
    bnIn: "যশোরে",
    bnOf: "যশোরের",
    upazilasBn: ["যশোর সদর", "অভয়নগর", "বাঘারপাড়া", "চৌগাছা", "ঝিকরগাছা", "কেশবপুর", "মণিরামপুর", "শার্শা", "বেনাপোল"],
    upazilasEn: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha", "Benapole"],
    division: "khulna",
    core: true,
  },
  {
    slug: "jhenaidah",
    en: "Jhenaidah",
    enAlt: ["Jhenidah"],
    bn: "ঝিনাইদহ",
    bnIn: "ঝিনাইদহে",
    bnOf: "ঝিনাইদহের",
    upazilasBn: ["ঝিনাইদহ সদর", "শৈলকুপা", "হরিণাকুণ্ডু", "কালীগঞ্জ", "কোটচাঁদপুর", "মহেশপুর"],
    upazilasEn: ["Jhenaidah Sadar", "Shailkupa", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur"],
    division: "khulna",
    core: true,
  },
  {
    slug: "magura",
    en: "Magura",
    enAlt: [],
    bn: "মাগুরা",
    bnIn: "মাগুরায়",
    bnOf: "মাগুরার",
    upazilasBn: ["মাগুরা সদর", "শ্রীপুর", "শালিখা", "মহম্মদপুর"],
    upazilasEn: ["Magura Sadar", "Sreepur", "Shalikha", "Mohammadpur"],
    division: "khulna",
    core: true,
  },
  {
    slug: "satkhira",
    en: "Satkhira",
    enAlt: ["Shatkhira"],
    bn: "সাতক্ষীরা",
    bnIn: "সাতক্ষীরায়",
    bnOf: "সাতক্ষীরার",
    upazilasBn: ["সাতক্ষীরা সদর", "আশাশুনি", "দেবহাটা", "কলারোয়া", "কালীগঞ্জ", "শ্যামনগর", "তালা"],
    upazilasEn: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
    division: "khulna",
    core: true,
  },
  {
    slug: "khulna",
    en: "Khulna",
    enAlt: [],
    bn: "খুলনা",
    bnIn: "খুলনায়",
    bnOf: "খুলনার",
    upazilasBn: ["খুলনা মহানগর", "বটিয়াঘাটা", "দাকোপ", "ডুমুরিয়া", "দিঘলিয়া", "কয়রা", "পাইকগাছা", "ফুলতলা", "রূপসা", "তেরখাদা"],
    upazilasEn: ["Khulna City", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"],
    division: "khulna",
    core: true,
  },
  {
    slug: "narail",
    en: "Narail",
    enAlt: [],
    bn: "নড়াইল",
    bnIn: "নড়াইলে",
    bnOf: "নড়াইলের",
    upazilasBn: ["নড়াইল সদর", "লোহাগড়া", "কালিয়া"],
    upazilasEn: ["Narail Sadar", "Lohagara", "Kalia"],
    division: "khulna",
    core: true,
  },
  {
    slug: "bagerhat",
    en: "Bagerhat",
    enAlt: [],
    bn: "বাগেরহাট",
    bnIn: "বাগেরহাটে",
    bnOf: "বাগেরহাটের",
    upazilasBn: ["বাগেরহাট সদর", "চিতলমারী", "ফকিরহাট", "কচুয়া", "মোল্লাহাট", "মোংলা", "মোড়েলগঞ্জ", "রামপাল", "শরণখোলা"],
    upazilasEn: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
    division: "khulna",
    core: true,
  },
  {
    slug: "kushtia",
    en: "Kushtia",
    enAlt: [],
    bn: "কুষ্টিয়া",
    bnIn: "কুষ্টিয়ায়",
    bnOf: "কুষ্টিয়ার",
    upazilasBn: ["কুষ্টিয়া সদর", "কুমারখালী", "খোকসা", "মিরপুর", "দৌলতপুর", "ভেড়ামারা"],
    upazilasEn: ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Daulatpur", "Bheramara"],
    division: "khulna",
    core: true,
  },
  {
    slug: "chuadanga",
    en: "Chuadanga",
    enAlt: [],
    bn: "চুয়াডাঙ্গা",
    bnIn: "চুয়াডাঙ্গায়",
    bnOf: "চুয়াডাঙ্গার",
    upazilasBn: ["চুয়াডাঙ্গা সদর", "আলমডাঙ্গা", "দামুড়হুদা", "জীবননগর"],
    upazilasEn: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
    division: "khulna",
    core: true,
  },
  {
    slug: "meherpur",
    en: "Meherpur",
    enAlt: [],
    bn: "মেহেরপুর",
    bnIn: "মেহেরপুরে",
    bnOf: "মেহেরপুরের",
    upazilasBn: ["মেহেরপুর সদর", "গাংনী", "মুজিবনগর"],
    upazilasEn: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
    division: "khulna",
    core: true,
  },
]);

export type Division = "khulna" | "dhaka" | "chattogram" | "rajshahi" | "barishal" | "sylhet" | "rangpur" | "mymensingh";

export const DIVISIONS: { id: Division; bn: string; en: string }[] = [
  { id: "khulna", bn: "খুলনা বিভাগ", en: "Khulna Division" },
  { id: "dhaka", bn: "ঢাকা বিভাগ", en: "Dhaka Division" },
  { id: "chattogram", bn: "চট্টগ্রাম বিভাগ", en: "Chattogram Division" },
  { id: "rajshahi", bn: "রাজশাহী বিভাগ", en: "Rajshahi Division" },
  { id: "barishal", bn: "বরিশাল বিভাগ", en: "Barishal Division" },
  { id: "sylhet", bn: "সিলেট বিভাগ", en: "Sylhet Division" },
  { id: "rangpur", bn: "রংপুর বিভাগ", en: "Rangpur Division" },
  { id: "mymensingh", bn: "ময়মনসিংহ বিভাগ", en: "Mymensingh Division" },
];

// Bangla case endings: consonant → "যশোরে / যশোরের", -া → "ঢাকায় / ঢাকার", -ি/-ী → "ফেনীতে / ফেনীর".
function bnForms(bn: string): { bnIn: string; bnOf: string } {
  const base = bn.replace(/ঁ$/, "");
  const last = base.slice(-1);
  if (last === "া") return { bnIn: `${bn}য়`, bnOf: `${bn}র` };
  if (last === "ি" || last === "ী") return { bnIn: `${bn}তে`, bnOf: `${bn}র` };
  if (last === "ও") return { bnIn: `${bn}য়ে`, bnOf: `${bn}য়ের` };
  return { bnIn: `${bn}ে`, bnOf: `${bn}ের` };
}

// [slug, English, Bangla, division, alternative English spellings]
const OTHER_DISTRICTS: [string, string, string, Division, string[]?][] = [
  ["dhaka", "Dhaka", "ঢাকা", "dhaka", ["Dacca"]],
  ["gazipur", "Gazipur", "গাজীপুর", "dhaka"],
  ["narayanganj", "Narayanganj", "নারায়ণগঞ্জ", "dhaka"],
  ["narsingdi", "Narsingdi", "নরসিংদী", "dhaka"],
  ["manikganj", "Manikganj", "মানিকগঞ্জ", "dhaka"],
  ["munshiganj", "Munshiganj", "মুন্সীগঞ্জ", "dhaka"],
  ["tangail", "Tangail", "টাঙ্গাইল", "dhaka"],
  ["kishoreganj", "Kishoreganj", "কিশোরগঞ্জ", "dhaka"],
  ["faridpur", "Faridpur", "ফরিদপুর", "dhaka"],
  ["gopalganj", "Gopalganj", "গোপালগঞ্জ", "dhaka"],
  ["madaripur", "Madaripur", "মাদারীপুর", "dhaka"],
  ["rajbari", "Rajbari", "রাজবাড়ী", "dhaka"],
  ["shariatpur", "Shariatpur", "শরীয়তপুর", "dhaka"],
  ["chattogram", "Chattogram", "চট্টগ্রাম", "chattogram", ["Chittagong"]],
  ["coxs-bazar", "Cox's Bazar", "কক্সবাজার", "chattogram", ["Coxs Bazar"]],
  ["cumilla", "Cumilla", "কুমিল্লা", "chattogram", ["Comilla"]],
  ["brahmanbaria", "Brahmanbaria", "ব্রাহ্মণবাড়িয়া", "chattogram"],
  ["chandpur", "Chandpur", "চাঁদপুর", "chattogram"],
  ["feni", "Feni", "ফেনী", "chattogram"],
  ["lakshmipur", "Lakshmipur", "লক্ষ্মীপুর", "chattogram", ["Laxmipur"]],
  ["noakhali", "Noakhali", "নোয়াখালী", "chattogram"],
  ["khagrachhari", "Khagrachhari", "খাগড়াছড়ি", "chattogram"],
  ["rangamati", "Rangamati", "রাঙ্গামাটি", "chattogram"],
  ["bandarban", "Bandarban", "বান্দরবান", "chattogram"],
  ["rajshahi", "Rajshahi", "রাজশাহী", "rajshahi"],
  ["bogura", "Bogura", "বগুড়া", "rajshahi", ["Bogra"]],
  ["joypurhat", "Joypurhat", "জয়পুরহাট", "rajshahi"],
  ["naogaon", "Naogaon", "নওগাঁ", "rajshahi"],
  ["natore", "Natore", "নাটোর", "rajshahi"],
  ["chapainawabganj", "Chapainawabganj", "চাঁপাইনবাবগঞ্জ", "rajshahi", ["Chapai Nawabganj"]],
  ["pabna", "Pabna", "পাবনা", "rajshahi"],
  ["sirajganj", "Sirajganj", "সিরাজগঞ্জ", "rajshahi"],
  ["barishal", "Barishal", "বরিশাল", "barishal", ["Barisal"]],
  ["barguna", "Barguna", "বরগুনা", "barishal"],
  ["bhola", "Bhola", "ভোলা", "barishal"],
  ["jhalokathi", "Jhalokathi", "ঝালকাঠি", "barishal", ["Jhalakathi"]],
  ["patuakhali", "Patuakhali", "পটুয়াখালী", "barishal"],
  ["pirojpur", "Pirojpur", "পিরোজপুর", "barishal"],
  ["sylhet", "Sylhet", "সিলেট", "sylhet"],
  ["habiganj", "Habiganj", "হবিগঞ্জ", "sylhet"],
  ["moulvibazar", "Moulvibazar", "মৌলভীবাজার", "sylhet"],
  ["sunamganj", "Sunamganj", "সুনামগঞ্জ", "sylhet"],
  ["rangpur", "Rangpur", "রংপুর", "rangpur"],
  ["dinajpur", "Dinajpur", "দিনাজপুর", "rangpur"],
  ["gaibandha", "Gaibandha", "গাইবান্ধা", "rangpur"],
  ["kurigram", "Kurigram", "কুড়িগ্রাম", "rangpur"],
  ["lalmonirhat", "Lalmonirhat", "লালমনিরহাট", "rangpur"],
  ["nilphamari", "Nilphamari", "নীলফামারী", "rangpur"],
  ["panchagarh", "Panchagarh", "পঞ্চগড়", "rangpur"],
  ["thakurgaon", "Thakurgaon", "ঠাকুরগাঁও", "rangpur"],
  ["mymensingh", "Mymensingh", "ময়মনসিংহ", "mymensingh"],
  ["jamalpur", "Jamalpur", "জামালপুর", "mymensingh"],
  ["netrokona", "Netrokona", "নেত্রকোনা", "mymensingh"],
  ["sherpur", "Sherpur", "শেরপুর", "mymensingh"],
];

export const AREAS: Area[] = [
  ...CORE_AREAS,
  ...OTHER_DISTRICTS.map(([slug, en, bn, division, enAlt = []]) => ({
    slug,
    en,
    enAlt,
    bn,
    ...bnForms(bn),
    upazilasBn: [],
    upazilasEn: [],
    division,
    core: false,
  })),
];

export const CORE = AREAS.filter((a) => a.core);

export function getArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
