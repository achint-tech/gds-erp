CREATE TYPE "public"."client_purchase_order_status" AS ENUM('Active', 'Cancelled');--> statement-breakpoint
CREATE TABLE "client_purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"po_number" varchar(120) NOT NULL,
	"po_date" date NOT NULL,
	"po_amount" numeric(18, 2) NOT NULL,
	"po_document_link" text,
	"notes" text,
	"status" "client_purchase_order_status" DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_purchase_orders_amount_positive" CHECK ("client_purchase_orders"."po_amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "client_purchase_orders" ADD CONSTRAINT "client_purchase_orders_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_purchase_orders_project_id_index" ON "client_purchase_orders" USING btree ("project_id");