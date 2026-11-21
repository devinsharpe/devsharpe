CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"excerpt" text,
	"published_at" timestamp,
	"revised_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "post_published_at_idx" ON "post" ("published_at");