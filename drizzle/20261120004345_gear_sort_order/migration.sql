ALTER TABLE "camera" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hardware_item" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "software_item" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;