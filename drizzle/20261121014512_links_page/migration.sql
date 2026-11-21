CREATE TABLE "link_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"url" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"last_clicked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "links_bio" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "links_photo_media_id" uuid;--> statement-breakpoint
CREATE INDEX "link_item_sort_order_idx" ON "link_item" ("sort_order");--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_links_photo_media_id_media_id_fkey" FOREIGN KEY ("links_photo_media_id") REFERENCES "media"("id") ON DELETE SET NULL;