CREATE TABLE "project" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"app_link" text,
	"github_link" text,
	"badges" text[] DEFAULT '{}'::text[] NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
