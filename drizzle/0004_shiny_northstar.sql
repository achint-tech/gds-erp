CREATE TYPE "public"."print_request_status" AS ENUM('Raised', 'Sent to Vendor', 'In Production', 'Ready', 'Dispatched', 'Installed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."print_size_unit" AS ENUM('mm', 'cm', 'inch', 'ft');--> statement-breakpoint
CREATE TYPE "public"."print_type" AS ENUM('Vinyl', 'Sticker', 'Flex', 'Sunboard', 'Fabric', 'Backlit', 'Other');--> statement-breakpoint
CREATE TABLE "print_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"print_type" "print_type" NOT NULL,
	"description" text NOT NULL,
	"width" numeric(12, 2),
	"height" numeric(12, 2),
	"size_unit" "print_size_unit",
	"quantity" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"artwork_link" text,
	"requested_by_user_id" uuid NOT NULL,
	"required_by_date" date,
	"vendor_name" varchar(255),
	"status" "print_request_status" DEFAULT 'Raised' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "print_requests_quantity_positive" CHECK ("print_requests"."quantity" > 0),
	CONSTRAINT "print_requests_dimensions_complete" CHECK (("print_requests"."width" IS NULL AND "print_requests"."height" IS NULL AND "print_requests"."size_unit" IS NULL) OR ("print_requests"."width" IS NOT NULL AND "print_requests"."height" IS NOT NULL AND "print_requests"."size_unit" IS NOT NULL)),
	CONSTRAINT "print_requests_width_positive" CHECK ("print_requests"."width" IS NULL OR "print_requests"."width" > 0),
	CONSTRAINT "print_requests_height_positive" CHECK ("print_requests"."height" IS NULL OR "print_requests"."height" > 0)
);
--> statement-breakpoint
ALTER TABLE "print_requests" ADD CONSTRAINT "print_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_requests" ADD CONSTRAINT "print_requests_requested_by_user_id_internal_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."internal_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "print_requests_project_id_index" ON "print_requests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "print_requests_requested_by_user_id_index" ON "print_requests" USING btree ("requested_by_user_id");