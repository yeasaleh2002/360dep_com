/** WhatsApp deep links. NEXT_PUBLIC_* values are inlined at build time, so this is client-safe. */

function whatsappNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

/** `https://wa.me/<number>?text=<encoded>` — encodeURIComponent keeps Bangla and emoji intact. */
export function whatsappLink(text?: string): string {
  const number = whatsappNumber();
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** General "chat with us" link: the business profile link if configured, else the number. */
export function whatsappProfileLink(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_PROFILE_LINK || whatsappLink();
}

/** Formats a stored lead phone number into a wa.me link so the admin can reply in one tap. */
export function whatsappLinkForPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Bangladeshi local format (01XXXXXXXXX) → international (8801XXXXXXXXX)
  if (digits.length === 11 && digits.startsWith("01")) digits = `88${digits}`;
  return `https://wa.me/${digits}`;
}
