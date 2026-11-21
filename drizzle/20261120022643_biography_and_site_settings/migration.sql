CREATE TABLE "biography_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"content" jsonb NOT NULL,
	"restored_from_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"subtitle" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_single_row" CHECK ("id" = 1)
);
--> statement-breakpoint
CREATE INDEX "biography_version_created_at_idx" ON "biography_version" ("created_at");--> statement-breakpoint
ALTER TABLE "biography_version" ADD CONSTRAINT "biography_version_restored_from_id_biography_version_id_fkey" FOREIGN KEY ("restored_from_id") REFERENCES "biography_version"("id") ON DELETE SET NULL;