CREATE TYPE "public"."issue_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('new', 'triaging', 'resolved_by_agent', 'escalated', 'assigned', 'in_progress', 'awaiting_confirmation', 'closed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('tenant', 'property_manager', 'landlord');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer,
	"action" text NOT NULL,
	"details" text,
	"would_notify" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issue_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"status" "issue_status" DEFAULT 'new' NOT NULL,
	"priority" "issue_priority" DEFAULT 'medium',
	"resolved_by_agent" text,
	"assigned_to" text,
	"follow_up_date" timestamp,
	"closed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"property_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"room_number" text,
	"move_in_date" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_activity" ADD CONSTRAINT "agent_activity_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_messages" ADD CONSTRAINT "issue_messages_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenants" ADD CONSTRAINT "tenants_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_activity_issue_id_idx" ON "agent_activity" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issue_messages_issue_id_idx" ON "issue_messages" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issues_tenant_id_idx" ON "issues" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issues_property_id_idx" ON "issues" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issues_status_idx" ON "issues" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_clerk_user_id_idx" ON "tenants" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_property_id_idx" ON "tenants" USING btree ("property_id");