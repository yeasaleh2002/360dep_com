// Zod schemas shared by forms and API routes. Public-form messages are i18n keys.
import { z } from "zod";
import { getYouTubeId } from "@/lib/youtube";

// ---- Reusable field builders ---------------------------------------------------------

const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} needs at least ${min} characters`)
    .max(max, `${label} must be under ${max} characters`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const isImgbbUrl = (value: string) => /^https:\/\/([a-z0-9-]+\.)*ibb\.co\//i.test(value);

const imageUrl = (message = "Please upload an image") =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, message)
    .url(message)
    .refine(isImgbbUrl, "Images must be uploaded through the uploader");

const optionalImageUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isImgbbUrl(v), "Images must be uploaded through the uploader");

/** Accepts "facebook.com/page" too — non-technical users rarely type the scheme. */
const optionalLink = z
  .string()
  .trim()
  .max(300, "This link is too long")
  .optional()
  .nullable()
  .transform((v) => {
    if (!v) return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  })
  .refine((v) => {
    if (v === null) return true;
    try {
      const u = new URL(v);
      return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "This doesn't look like a valid web link");

const price = z.preprocess(
  (v) => {
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v === "string") return Number(v.replace(/[,\s৳]/g, ""));
    return v;
  },
  z
    .number({ invalid_type_error: "Enter numbers only" })
    .int("Whole taka only — no decimals")
    .min(0, "Price can't be negative")
    .max(1_000_000_000, "That number is too large")
    .nullable(),
);

const isActive = z.boolean().default(true);

// ---- Admin content schemas -----------------------------------------------------------

export const bannerSchema = z.object({
  imageUrl: imageUrl(),
  title: optionalText(120),
  description: optionalText(300),
  isActive,
});

export const serviceSchema = z
  .object({
    title: requiredText("Service name", 2, 100),
    description: requiredText("Description", 10, 1500),
    imageUrl: optionalImageUrl,
    priceMin: price,
    priceMax: price,
    isActive,
  })
  .refine((d) => d.priceMin == null || d.priceMax == null || d.priceMax >= d.priceMin, {
    path: ["priceMax"],
    message: "The highest price should be equal to or more than the starting price",
  });

export const teamSchema = z.object({
  name: requiredText("Name", 2, 80),
  designation: requiredText("Role / designation", 2, 80),
  photoUrl: optionalImageUrl,
  bio: optionalText(600),
  facebook: optionalLink,
  linkedin: optionalLink,
  isActive,
});

export const clientSchema = z.object({
  name: requiredText("Client name", 1, 100),
  logoUrl: imageUrl("Please upload the client's logo"),
  website: optionalLink,
  feedback: optionalText(600),
  isActive,
});

export const gallerySchema = z
  .object({
    title: requiredText("Title", 2, 120),
    description: optionalText(1000),
    category: optionalText(40),
    images: z.array(imageUrl()).max(40, "Up to 40 photos per gallery item").default([]),
    youtubeUrl: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || getYouTubeId(v) !== null, "Paste a normal YouTube video link"),
    isFeatured: z.boolean().default(false),
    isActive,
  })
  .refine((d) => d.images.length > 0 || d.youtubeUrl, {
    path: ["images"],
    message: "Add at least one photo or a YouTube video",
  });

export const flagsSchema = z
  .object({ isActive: z.boolean().optional(), isFeatured: z.boolean().optional() })
  .strict()
  .refine((d) => d.isActive !== undefined || d.isFeatured !== undefined, "Nothing to update");

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1).max(40)).min(1).max(500),
});

export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const leadUpdateSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  password: z.string().min(1, "Enter your password").max(200),
  turnstileToken: z.string().max(4096).optional(),
});

// ---- Public contact form -------------------------------------------------------------

export const OTHER_SERVICE = "__other__";

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Converts Bangla digits to ASCII and strips separators, keeping a leading +. */
export function normalizePhone(value: string): string {
  const ascii = value.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)));
  return ascii.replace(/(?!^\+)[^\d]/g, "");
}

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "errors.nameShort").max(80, "errors.tooLong"),
    phone: z
      .string()
      .trim()
      .min(1, "errors.required")
      .max(25, "errors.phoneInvalid")
      .refine((v) => /^\+?\d{7,15}$/.test(normalizePhone(v)), "errors.phoneInvalid"),
    email: z.union([z.literal(""), z.string().trim().email("errors.emailInvalid").max(120, "errors.tooLong")]).optional(),
    service: z.string().min(1, "errors.serviceRequired").max(40),
    customService: z.string().trim().max(100, "errors.tooLong").optional(),
    message: z.string().trim().max(1500, "errors.messageLong").optional(),
    turnstileToken: z.string().max(4096).optional(),
    website: z.string().max(300).optional(), // honeypot
  })
  .superRefine((d, ctx) => {
    if (d.service === OTHER_SERVICE && (!d.customService || d.customService.length < 2)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customService"], message: "errors.customServiceRequired" });
    }
  });

export type ContactInput = z.input<typeof contactSchema>;
