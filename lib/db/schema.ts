// All tables are prefixed `360dep_` because the database is shared with other apps.
// After editing this file run `npm run db:push`.
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const newId = () => crypto.randomUUID().replace(/-/g, "");

const id = () => text("id").primaryKey().$defaultFn(newId);
const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const sortOrder = () => integer("sort_order").notNull().default(0);
const isActive = () => boolean("is_active").notNull().default(true);

export const banners = pgTable(
  "360dep_banners",
  {
    id: id(),
    imageUrl: text("image_url").notNull(),
    title: text("title"),
    description: text("description"),
    order: sortOrder(),
    isActive: isActive(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("360dep_banners_active_order_idx").on(t.isActive, t.order)],
);

export const services = pgTable(
  "360dep_services",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique("360dep_services_slug_key"),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    priceMin: integer("price_min"),
    priceMax: integer("price_max"),
    order: sortOrder(),
    isActive: isActive(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("360dep_services_active_order_idx").on(t.isActive, t.order)],
);

export const teamMembers = pgTable(
  "360dep_team_members",
  {
    id: id(),
    name: text("name").notNull(),
    designation: text("designation").notNull(),
    photoUrl: text("photo_url"),
    bio: text("bio"),
    facebook: text("facebook"),
    linkedin: text("linkedin"),
    order: sortOrder(),
    isActive: isActive(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("360dep_team_members_active_order_idx").on(t.isActive, t.order)],
);

export const clients = pgTable(
  "360dep_clients",
  {
    id: id(),
    name: text("name").notNull(),
    logoUrl: text("logo_url").notNull(),
    website: text("website"),
    feedback: text("feedback"),
    order: sortOrder(),
    isActive: isActive(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("360dep_clients_active_order_idx").on(t.isActive, t.order)],
);

export const galleryItems = pgTable(
  "360dep_gallery_items",
  {
    id: id(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    images: text("images").array().notNull().default([]),
    youtubeUrl: text("youtube_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    order: sortOrder(),
    isActive: isActive(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("360dep_gallery_items_active_order_idx").on(t.isActive, t.order),
    index("360dep_gallery_items_active_featured_idx").on(t.isActive, t.isFeatured),
  ],
);

// Contact-form enquiries shown under Admin → Enquiries.
export const leads = pgTable(
  "360dep_leads",
  {
    id: id(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
    // Copy of the service name, so the enquiry still reads correctly if the service is renamed or deleted.
    serviceTitle: text("service_title"),
    customService: text("custom_service"),
    message: text("message"),
    status: text("status").notNull().default("new"), // new | contacted | closed
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("360dep_leads_status_created_idx").on(t.status, t.createdAt),
    index("360dep_leads_created_idx").on(t.createdAt),
  ],
);

export type Banner = typeof banners.$inferSelect;
export type Service = typeof services.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Lead = typeof leads.$inferSelect;
