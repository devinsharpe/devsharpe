ALTER TABLE "media" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
CREATE INDEX "media_tags_idx" ON "media" USING gin ("tags");