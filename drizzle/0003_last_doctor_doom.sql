CREATE TYPE "public"."design_task_status" AS ENUM('Not Started', 'In Progress', 'Waiting', 'Approved', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."design_type" AS ENUM('2D', '3D', 'MEP', 'Fixture Drawing', 'Other');--> statement-breakpoint
CREATE TYPE "public"."design_version_status" AS ENUM('Working', 'Submitted', 'Superseded', 'Approved');--> statement-breakpoint
CREATE TYPE "public"."design_waiting_for" AS ENUM('Client Feedback', 'Site Measurement', 'Inputs', 'Other');--> statement-breakpoint
CREATE TABLE "design_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"design_type" "design_type" NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"assigned_to_user_id" uuid NOT NULL,
	"target_date" date NOT NULL,
	"status" "design_task_status" DEFAULT 'Not Started' NOT NULL,
	"waiting_for" "design_waiting_for",
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "design_tasks_waiting_for_status_valid" CHECK ("design_tasks"."status" = 'Waiting' OR "design_tasks"."waiting_for" IS NULL)
);
--> statement-breakpoint
CREATE TABLE "design_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_task_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"drawing_link" text NOT NULL,
	"submitted_date" date,
	"status" "design_version_status" DEFAULT 'Working' NOT NULL,
	"revision_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "design_versions_task_version_unique" UNIQUE("design_task_id","version_number"),
	CONSTRAINT "design_versions_version_number_positive" CHECK ("design_versions"."version_number" > 0)
);
--> statement-breakpoint
ALTER TABLE "design_tasks" ADD CONSTRAINT "design_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_tasks" ADD CONSTRAINT "design_tasks_assigned_to_user_id_internal_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_versions" ADD CONSTRAINT "design_versions_design_task_id_design_tasks_id_fk" FOREIGN KEY ("design_task_id") REFERENCES "public"."design_tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "design_tasks_project_id_index" ON "design_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "design_tasks_assigned_to_user_id_index" ON "design_tasks" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "design_versions_one_approved_per_task" ON "design_versions" USING btree ("design_task_id") WHERE "design_versions"."status" = 'Approved';--> statement-breakpoint
CREATE INDEX "design_versions_design_task_id_index" ON "design_versions" USING btree ("design_task_id");