CREATE TABLE "resume" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"storage_key" text NOT NULL UNIQUE,
	"status" text DEFAULT 'pending' NOT NULL,
	"original_name" text NOT NULL,
	"byte_size" integer NOT NULL,
	"made_current_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "resume_status_made_current_at_idx" ON "resume" ("status","made_current_at");