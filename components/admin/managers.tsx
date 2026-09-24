"use client";

/**
 * Per-section admin configuration. Labels and help text are written for a non-technical
 * owner: plain words, what each field does, and where it shows up on the website.
 */
import { ResourceManager, type Item, type ManagerConfig } from "@/components/admin/resource-manager";
import { bannerSchema, clientSchema, gallerySchema, serviceSchema, teamSchema } from "@/lib/validators";
import { getYouTubeId, youtubeThumbnail } from "@/lib/youtube";

type Props = { initialItems: Item[]; autoOpen?: boolean };

const visibleSwitch = {
  name: "isActive",
  label: "Show on website",
  type: "switch" as const,
  help: "Turn off to hide it without deleting.",
};

const taka = (n: unknown) => (typeof n === "number" ? `৳${n.toLocaleString("en-IN")}` : null);

const bannerConfig: ManagerConfig = {
  endpoint: "/api/banners",
  singular: "Banner",
  plural: "Banners",
  intro:
    "Large photos at the top of the home page. With one banner it shows as a single image; with two or more they slide automatically.",
  schema: bannerSchema,
  defaults: { imageUrl: null, title: "", description: "", isActive: true },
  fields: [
    {
      name: "imageUrl",
      label: "Banner photo",
      type: "image",
      required: true,
      preset: "photo",
      aspect: "aspect-[16/7]",
      help: "Use a wide, landscape photo (at least 1920px wide looks best).",
    },
    { name: "title", label: "Heading on the photo", type: "text", placeholder: "e.g. Weddings, beautifully planned", help: "Leave empty to show the photo without text." },
    { name: "description", label: "Short line under the heading", type: "textarea", rows: 2, placeholder: "e.g. Wedding, corporate and special events — planned end to end" },
    visibleSwitch,
  ],
  thumb: (i) => (i.imageUrl as string) ?? null,
  title: (i) => (i.title as string) || "Banner (photo only)",
  subtitle: (i) => (i.description as string) || null,
};

const serviceConfig: ManagerConfig = {
  endpoint: "/api/services",
  singular: "Service",
  plural: "Services",
  intro:
    "Services appear on the home page, the Services page and in the Contact form's dropdown. Each one gets its own WhatsApp button.",
  schema: serviceSchema,
  defaults: { title: "", description: "", imageUrl: null, priceMin: "", priceMax: "", isActive: true },
  fields: [
    { name: "title", label: "Service name", type: "text", required: true, placeholder: "e.g. Wedding Planning" },
    { name: "description", label: "Description", type: "textarea", required: true, rows: 5, placeholder: "e.g. Venue decoration, stage, lighting, catering coordination and full management on the day.", help: "A few sentences about what's included." },
    { name: "imageUrl", label: "Photo", type: "image", preset: "photo", aspect: "aspect-[4/3]" },
    { name: "priceMin", label: "Starting price (৳)", type: "number", half: true, placeholder: "e.g. 50000", help: "Leave both prices empty to hide pricing." },
    { name: "priceMax", label: "Highest price (৳)", type: "number", half: true, placeholder: "e.g. 300000" },
    visibleSwitch,
  ],
  thumb: (i) => (i.imageUrl as string) ?? null,
  title: (i) => i.title as string,
  subtitle: (i) => {
    const min = taka(i.priceMin);
    const max = taka(i.priceMax);
    if (min && max) return `${min} – ${max}`;
    return min ? `From ${min}` : max ? `Up to ${max}` : "No price shown";
  },
};

const teamConfig: ManagerConfig = {
  endpoint: "/api/team",
  singular: "Team member",
  plural: "Team members",
  intro: "The people shown in the “Our team” section on the home page.",
  schema: teamSchema,
  defaults: { name: "", designation: "", photoUrl: null, bio: "", facebook: "", linkedin: "", isActive: true },
  fields: [
    { name: "name", label: "Full name", type: "text", required: true, half: true, placeholder: "e.g. Rahim Uddin" },
    { name: "designation", label: "Role / designation", type: "text", required: true, half: true, placeholder: "e.g. Lead Planner" },
    { name: "photoUrl", label: "Photo", type: "image", preset: "portrait", aspect: "aspect-[4/5] max-w-[240px]", help: "A portrait (upright) photo works best." },
    { name: "bio", label: "Short bio", type: "textarea", rows: 3, placeholder: "e.g. 8 years planning weddings and corporate events across Jashore." },
    { name: "facebook", label: "Facebook link", type: "url", half: true, placeholder: "facebook.com/…" },
    { name: "linkedin", label: "LinkedIn link", type: "url", half: true, placeholder: "linkedin.com/in/…" },
    visibleSwitch,
  ],
  thumb: (i) => (i.photoUrl as string) ?? null,
  title: (i) => i.name as string,
  subtitle: (i) => i.designation as string,
};

const clientConfig: ManagerConfig = {
  endpoint: "/api/clients",
  singular: "Client",
  plural: "Clients",
  intro: "Logos of companies and people you've worked with. They scroll across the home page and appear on the Clients page.",
  schema: clientSchema,
  defaults: { name: "", logoUrl: null, website: "", feedback: "", isActive: true },
  fields: [
    { name: "name", label: "Client name", type: "text", required: true, placeholder: "e.g. ABC Group" },
    {
      name: "logoUrl",
      label: "Logo",
      type: "image",
      required: true,
      preset: "logo",
      fit: "contain",
      aspect: "aspect-[3/1]",
      help: "A PNG with a transparent background looks cleanest.",
    },
    { name: "website", label: "Website", type: "url", placeholder: "www.example.com" },
    {
      name: "feedback",
      label: "Client feedback",
      type: "textarea",
      rows: 3,
      placeholder: "What the client said about working with you",
      help: "Shown as a quote on the website. Leave empty if you don't have one.",
    },
    visibleSwitch,
  ],
  thumb: (i) => (i.logoUrl as string) ?? null,
  thumbFit: "contain",
  title: (i) => i.name as string,
  subtitle: (i) => [i.feedback ? "Has feedback" : null, i.website as string | null].filter(Boolean).join(" · ") || null,
};

const galleryConfig: ManagerConfig = {
  endpoint: "/api/gallery",
  singular: "Gallery item",
  plural: "Gallery items",
  intro:
    "Each item is one event or album: a title, photos and optionally a YouTube video. Tap the star to feature an item on the home page.",
  schema: gallerySchema,
  defaults: { title: "", description: "", category: "", images: [], youtubeUrl: "", isFeatured: false, isActive: true },
  fields: (items) => {
    const categories = [...new Set(items.map((i) => (i.category as string | null)?.trim()).filter(Boolean) as string[])];
    return [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Rahman–Chowdhury Wedding Reception" },
      {
        name: "category",
        label: "Category",
        type: "text",
        half: true,
        placeholder: "e.g. Wedding",
        suggestions: categories,
        help: "Visitors can filter the gallery by category.",
      },
      { name: "youtubeUrl", label: "YouTube video link", type: "url", half: true, placeholder: "youtube.com/watch?v=…" },
      { name: "description", label: "Description", type: "textarea", rows: 3, placeholder: "e.g. Evening reception for 400 guests with a floral stage and warm lighting." },
      { name: "images", label: "Photos", type: "images", preset: "photo" },
      { name: "isFeatured", label: "Feature on the home page", type: "switch", help: "Featured items appear first in the home page gallery." },
      visibleSwitch,
    ];
  },
  featurable: true,
  thumb: (i) => {
    const images = i.images as string[];
    if (images?.[0]) return images[0];
    const id = getYouTubeId(i.youtubeUrl as string | null);
    return id ? youtubeThumbnail(id) : null;
  },
  title: (i) => i.title as string,
  subtitle: (i) => {
    const count = (i.images as string[])?.length ?? 0;
    const parts = [i.category as string | null, `${count} photo${count === 1 ? "" : "s"}`, i.youtubeUrl ? "video" : null];
    return parts.filter(Boolean).join(" · ");
  },
};

export const BannersManager = (p: Props) => <ResourceManager config={bannerConfig} {...p} />;
export const ServicesManager = (p: Props) => <ResourceManager config={serviceConfig} {...p} />;
export const TeamManager = (p: Props) => <ResourceManager config={teamConfig} {...p} />;
export const ClientsManager = (p: Props) => <ResourceManager config={clientConfig} {...p} />;
export const GalleryManager = (p: Props) => <ResourceManager config={galleryConfig} {...p} />;
