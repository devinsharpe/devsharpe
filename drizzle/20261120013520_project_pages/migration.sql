CREATE TABLE "project_page" (
	"project_id" text PRIMARY KEY,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_page" ADD CONSTRAINT "project_page_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;