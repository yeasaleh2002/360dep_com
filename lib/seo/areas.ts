// Service-area districts (Khulna division). Each gets its own page at /areas/<slug>.
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
};

export const HOME_AREA_SLUG = "jashore";

export const AREAS: Area[] = [
  {
    slug: "jashore",
    en: "Jashore",
    enAlt: ["Jessore"],
    bn: "যশোর",
    bnIn: "যশোরে",
    bnOf: "যশোরের",
    upazilasBn: ["যশোর সদর", "অভয়নগর", "বাঘারপাড়া", "চৌগাছা", "ঝিকরগাছা", "কেশবপুর", "মণিরামপুর", "শার্শা", "বেনাপোল"],
    upazilasEn: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha", "Benapole"],
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
  },
];

export function getArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
