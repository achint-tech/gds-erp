CREATE TYPE "public"."purchase_workspace_status" AS ENUM('Not Started', 'In Progress', 'Ordering', 'Partially Received', 'Received', 'Closed');--> statement-breakpoint
CREATE TABLE "project_purchase_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"purchase_owner_user_id" uuid,
	"status" "purchase_workspace_status" DEFAULT 'Not Started' NOT NULL,
	"purchase_sheet_link" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_purchase_workspaces_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "project_purchase_workspaces" ADD CONSTRAINT "project_purchase_workspaces_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_purchase_workspaces" ADD CONSTRAINT "project_purchase_workspaces_purchase_owner_user_id_internal_users_id_fk" FOREIGN KEY ("purchase_owner_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_purchase_workspaces_owner_id_index" ON "project_purchase_workspaces" USING btree ("purchase_owner_user_id");