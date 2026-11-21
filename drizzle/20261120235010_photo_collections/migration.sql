CREATE TABLE "page_view" (
	"kind" text,
	"target_id" uuid,
	"views" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_view_pkey" PRIMARY KEY("kind","target_id")
);
--> statement-breakpoint
CREATE TABLE "photo_collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"cover_media_id" uuid,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_collection_item" (
	"collection_id" uuid,
	"media_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "photo_collection_item_pkey" PRIMARY KEY("collection_id","media_id")
);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "location" text;--> statement-breakpoint
CREATE INDEX "photo_collection_published_at_idx" ON "photo_collection" ("published_at");--> statement-breakpoint
CREATE INDEX "photo_collection_item_media_id_idx" ON "photo_collection_item" ("media_id");--> statement-breakpoint
ALTER TABLE "photo_collection" ADD CONSTRAINT "photo_collection_cover_media_id_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "photo_collection_item" ADD CONSTRAINT "photo_collection_item_collection_id_photo_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "photo_collection"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photo_collection_item" ADD CONSTRAINT "photo_collection_item_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;