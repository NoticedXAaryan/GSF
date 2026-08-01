CREATE TYPE "public"."announcement_priority" AS ENUM('low', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'waitlisted', 'rejected', 'not_eligible', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('open', 'registration', 'restricted', 'shortlisted');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('Attendee', 'Volunteer', 'Faculty', 'Admin', 'Lead');--> statement-breakpoint
CREATE TYPE "public"."scan_result" AS ENUM('allowed', 'denied', 'already_checked_in');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'all',
	"priority" "announcement_priority" DEFAULT 'normal' NOT NULL,
	"created_at" bigint NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"sub_event_id" text NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"decided_by" text,
	"decided_at" bigint,
	"notes" text DEFAULT '',
	"checked_in" boolean DEFAULT false,
	"checked_in_at" bigint,
	"checked_in_by" text,
	"desk_id" text,
	"applied_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clearance_passes" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"pass_id" text NOT NULL,
	"qr_token" text NOT NULL,
	"issued_at" bigint NOT NULL,
	"revoked" boolean DEFAULT false,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"user_role" text DEFAULT 'Attendee',
	CONSTRAINT "clearance_passes_pass_id_unique" UNIQUE("pass_id"),
	CONSTRAINT "clearance_passes_qr_token_unique" UNIQUE("qr_token")
);
--> statement-breakpoint
CREATE TABLE "desks" (
	"id" text PRIMARY KEY NOT NULL,
	"sub_event_id" text NOT NULL,
	"sub_event_name" text DEFAULT '',
	"venue" text NOT NULL,
	"assigned_volunteer_uids" text[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"date" text NOT NULL,
	"day" integer DEFAULT 1 NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"venue" text NOT NULL,
	"type" "event_type" DEFAULT 'open' NOT NULL,
	"target_audience" text DEFAULT 'all',
	"capacity" integer,
	"current_registrations" integer DEFAULT 0,
	"requires_shortlisting" boolean DEFAULT false,
	"coordinator_name" text DEFAULT '',
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"pass_id" text NOT NULL,
	"uid" text NOT NULL,
	"user_name" text NOT NULL,
	"scanned_by_uid" text NOT NULL,
	"event_id" text NOT NULL,
	"event_name" text DEFAULT '',
	"result" "scan_result" NOT NULL,
	"reason" text DEFAULT '',
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "task_checklists" (
	"id" text PRIMARY KEY NOT NULL,
	"sub_event_id" text NOT NULL,
	"lead_uid" text NOT NULL,
	"title" text NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"checklist_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '',
	"due_date" text NOT NULL,
	"completed" boolean DEFAULT false,
	"completed_at" bigint,
	"sort_order" integer DEFAULT 0,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'Attendee' NOT NULL,
	"phone" text DEFAULT '',
	"college_dept" text DEFAULT '',
	"year" text DEFAULT '',
	"organization" text DEFAULT '',
	"pass_id" text DEFAULT '',
	"profile_complete" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_uid_user_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_sub_event_id_events_id_fk" FOREIGN KEY ("sub_event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clearance_passes" ADD CONSTRAINT "clearance_passes_uid_user_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desks" ADD CONSTRAINT "desks_sub_event_id_events_id_fk" FOREIGN KEY ("sub_event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklists" ADD CONSTRAINT "task_checklists_sub_event_id_events_id_fk" FOREIGN KEY ("sub_event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklists" ADD CONSTRAINT "task_checklists_lead_uid_user_id_fk" FOREIGN KEY ("lead_uid") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_checklist_id_task_checklists_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."task_checklists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_announcements_created_at" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_applications_uid_event" ON "applications" USING btree ("uid","sub_event_id");--> statement-breakpoint
CREATE INDEX "idx_applications_uid" ON "applications" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "idx_applications_sub_event_id" ON "applications" USING btree ("sub_event_id");--> statement-breakpoint
CREATE INDEX "idx_applications_status" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_clearance_passes_uid" ON "clearance_passes" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "idx_events_status" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_events_day" ON "events" USING btree ("day");--> statement-breakpoint
CREATE INDEX "idx_scan_logs_uid" ON "scan_logs" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "idx_scan_logs_event_id" ON "scan_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_scan_logs_timestamp" ON "scan_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_task_checklists_sub_event" ON "task_checklists" USING btree ("sub_event_id");--> statement-breakpoint
CREATE INDEX "idx_task_checklists_lead" ON "task_checklists" USING btree ("lead_uid");--> statement-breakpoint
CREATE INDEX "idx_tasks_checklist" ON "tasks" USING btree ("checklist_id");