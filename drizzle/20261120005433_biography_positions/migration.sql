CREATE TABLE "position" (
	"id" text PRIMARY KEY,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"name" text NOT NULL,
	"link" text,
	"team" text,
	"location" text,
	"office_type" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"description" text,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"technologies" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
