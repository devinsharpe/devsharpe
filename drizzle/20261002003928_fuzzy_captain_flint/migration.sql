CREATE TABLE "camera" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disclosure_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"message" text NOT NULL,
	"link" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hardware_item" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"link" text
);
--> statement-breakpoint
CREATE TABLE "software_item" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"description" text,
	"link" text,
	"disclosure" uuid
);
--> statement-breakpoint
ALTER TABLE "software_item" ADD CONSTRAINT "software_item_disclosure_disclosure_message_id_fkey" FOREIGN KEY ("disclosure") REFERENCES "disclosure_message"("id");