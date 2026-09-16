CREATE TYPE "public"."project_lifecycle" AS ENUM('Draft', 'Active', 'Archived', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('Quotation', 'PO Received', 'Project Planning', 'Design in Progress', 'In Production', 'Installation', 'Measurement', 'Handover', 'Billing', 'Payment');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('Civil', 'SIS', 'Turnkey', 'Fixtures');--> statement-breakpoint
CREATE TABLE "financial_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(10) NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"next_job_number" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "financial_years_label_unique" UNIQUE("label"),
	CONSTRAINT "financial_year_dates_valid" CHECK ("financial_years"."ends_on" >= "financial_years"."starts_on"),
	CONSTRAINT "financial_year_next_job_number_positive" CHECK ("financial_years"."next_job_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "internal_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"capabilities" text[] DEFAULT '{}'::text[] NOT NULL,
	"auth_subject" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "internal_users_display_name_unique" UNIQUE("display_name"),
	CONSTRAINT "internal_users_auth_subject_unique" UNIQUE("auth_subject")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_year_id" uuid NOT NULL,
	"job_code" varchar(24) NOT NULL,
	"project_name" varchar(255),
	"brand" varchar(255),
	"project_type" "project_type",
	"lead_user_id" uuid,
	"project_manager_user_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"site_address" text,
	"city" varchar(160),
	"client_poc_name" varchar(160),
	"client_poc_email" varchar(320),
	"client_poc_phone" varchar(40),
	"project_status" "project_status" DEFAULT 'Quotation' NOT NULL,
	"lifecycle_state" "project_lifecycle" DEFAULT 'Draft' NOT NULL,
	"notes" text,
	"activated_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_financial_year_job_code_unique" UNIQUE("financial_year_id","job_code"),
	CONSTRAINT "projects_job_code_format" CHECK ("projects"."job_code" ~ '^GDS[0-9]{3,}$')
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_financial_year_id_financial_years_id_fk" FOREIGN KEY ("financial_year_id") REFERENCES "public"."financial_years"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_user_id_internal_users_id_fk" FOREIGN KEY ("lead_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_user_id_internal_users_id_fk" FOREIGN KEY ("project_manager_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_internal_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;