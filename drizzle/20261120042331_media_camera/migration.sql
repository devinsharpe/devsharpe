ALTER TABLE "media" ADD COLUMN "camera_id" text;--> statement-breakpoint
CREATE INDEX "media_camera_id_idx" ON "media" ("camera_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_camera_id_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;