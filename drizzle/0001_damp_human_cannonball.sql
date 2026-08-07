CREATE TABLE "idea_pitch_data" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"team_name" text NOT NULL,
	"idea_title" text NOT NULL,
	"idea_summary" text NOT NULL,
	"problem_solution" text NOT NULL,
	"team_members" jsonb NOT NULL,
	CONSTRAINT "idea_pitch_data_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "masterclass_data" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"sessions" jsonb NOT NULL,
	CONSTRAINT "masterclass_data_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "reel_pitch_data" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"instagram_url" text NOT NULL,
	"team_members" jsonb NOT NULL,
	"acknowledged_rules" boolean DEFAULT false NOT NULL,
	CONSTRAINT "reel_pitch_data_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "rejection_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "enrollment_number" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "university_id" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "account_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin_notes" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "idea_pitch_data" ADD CONSTRAINT "idea_pitch_data_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "masterclass_data" ADD CONSTRAINT "masterclass_data_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_pitch_data" ADD CONSTRAINT "reel_pitch_data_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_enrollment_number" ON "user" USING btree ("enrollment_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_university_id" ON "user" USING btree ("university_id");