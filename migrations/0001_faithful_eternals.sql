CREATE TYPE "public"."property_status" AS ENUM('available', 'occupied');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"total_rooms" integer NOT NULL,
	"monthly_rent" integer NOT NULL,
	"status" "property_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"image_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_owner_id_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties" USING btree ("status");