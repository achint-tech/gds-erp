CREATE TYPE "public"."costing_entry_status" AS ENUM('Awaiting', 'Received', 'Finalised', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."costing_source" AS ENUM('Internal', 'Vendor');--> statement-breakpoint
CREATE TYPE "public"."costing_work_category" AS ENUM('Civil', 'Electrical', 'HVAC', 'Fire', 'Fixtures', 'Metal Fixtures', 'Signage / Branding', 'MEP', 'Flooring', 'Ceiling', 'Painting', 'Plumbing', 'Installation', 'Logistics', 'Other');--> statement-breakpoint
CREATE TYPE "public"."costing_workflow_status" AS ENUM('Not Started', 'In Progress', 'Awaiting Cost', 'Costing Complete');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('Draft', 'Submitted', 'Superseded', 'Final');--> statement-breakpoint
CREATE TABLE "project_costing_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"work_category" "costing_work_category" NOT NULL,
	"costing_source" "costing_source" NOT NULL,
	"vendor_party" varchar(255),
	"cost_amount" numeric(18, 2) NOT NULL,
	"costing_link" text,
	"status" "costing_entry_status" DEFAULT 'Awaiting' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_costing_entries_amount_positive" CHECK ("project_costing_entries"."cost_amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "project_costing_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"requirement_received_date" date,
	"requirement_boq_link" text,
	"scope_notes" text,
	"costing_status" "costing_workflow_status" DEFAULT 'Not Started' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_costing_requirements_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "project_quotation_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"quotation_date" date NOT NULL,
	"quotation_amount" numeric(18, 2) NOT NULL,
	"quotation_link" text,
	"status" "quotation_status" DEFAULT 'Draft' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_quotation_versions_project_version_unique" UNIQUE("project_id","version_number"),
	CONSTRAINT "project_quotation_versions_version_positive" CHECK ("project_quotation_versions"."version_number" > 0),
	CONSTRAINT "project_quotation_versions_amount_positive" CHECK ("project_quotation_versions"."quotation_amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "project_costing_entries" ADD CONSTRAINT "project_costing_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_costing_requirements" ADD CONSTRAINT "project_costing_requirements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_quotation_versions" ADD CONSTRAINT "project_quotation_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_costing_entries_project_id_index" ON "project_costing_entries" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_quotation_versions_one_final_per_project" ON "project_quotation_versions" USING btree ("project_id") WHERE "project_quotation_versions"."status" = 'Final';--> statement-breakpoint
CREATE INDEX "project_quotation_versions_project_id_index" ON "project_quotation_versions" USING btree ("project_id");