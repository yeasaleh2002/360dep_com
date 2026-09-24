CREATE TABLE "360dep_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "360dep_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text NOT NULL,
	"website" text,
	"feedback" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "360dep_gallery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"youtube_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "360dep_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"service_id" text,
	"service_title" text,
	"custom_service" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "360dep_services" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"price_min" integer,
	"price_max" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "360dep_services_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "360dep_team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"photo_url" text,
	"bio" text,
	"facebook" text,
	"linkedin" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "360dep_leads" ADD CONSTRAINT "360dep_leads_service_id_360dep_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."360dep_services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "360dep_banners_active_order_idx" ON "360dep_banners" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "360dep_clients_active_order_idx" ON "360dep_clients" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "360dep_gallery_items_active_order_idx" ON "360dep_gallery_items" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "360dep_gallery_items_active_featured_idx" ON "360dep_gallery_items" USING btree ("is_active","is_featured");--> statement-breakpoint
CREATE INDEX "360dep_leads_status_created_idx" ON "360dep_leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "360dep_leads_created_idx" ON "360dep_leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "360dep_services_active_order_idx" ON "360dep_services" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "360dep_team_members_active_order_idx" ON "360dep_team_members" USING btree ("is_active","sort_order");