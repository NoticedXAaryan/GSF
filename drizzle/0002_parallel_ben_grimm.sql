CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"type" text NOT NULL,
	"link" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"event_id" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team_leader_id" text NOT NULL,
	"invite_code" text NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "teams_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "idea_pitch_data" ADD COLUMN "pitch_deck_url" text;--> statement-breakpoint
ALTER TABLE "reel_pitch_data" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reel_pitch_data" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_uid_user_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_drafts" ADD CONSTRAINT "registration_drafts_uid_user_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_leader_id_user_id_fk" FOREIGN KEY ("team_leader_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;