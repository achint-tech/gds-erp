import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", [
  "Civil",
  "SIS",
  "Turnkey",
  "Fixtures",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "Quotation",
  "PO Received",
  "Project Planning",
  "Design in Progress",
  "In Production",
  "Installation",
  "Measurement",
  "Handover",
  "Billing",
  "Payment",
]);

export const projectLifecycleEnum = pgEnum("project_lifecycle", [
  "Draft",
  "Active",
  "Archived",
  "Closed",
]);

export const clientPurchaseOrderStatusEnum = pgEnum(
  "client_purchase_order_status",
  ["Active", "Cancelled"],
);

export const costingWorkflowStatusEnum = pgEnum("costing_workflow_status", [
  "Not Started",
  "In Progress",
  "Awaiting Cost",
  "Costing Complete",
]);

export const costingSourceEnum = pgEnum("costing_source", [
  "Internal",
  "Vendor",
]);

export const costingEntryStatusEnum = pgEnum("costing_entry_status", [
  "Awaiting",
  "Received",
  "Finalised",
  "Cancelled",
]);

export const costingWorkCategoryEnum = pgEnum("costing_work_category", [
  "Civil",
  "Electrical",
  "HVAC",
  "Fire",
  "Fixtures",
  "Metal Fixtures",
  "Signage / Branding",
  "MEP",
  "Flooring",
  "Ceiling",
  "Painting",
  "Plumbing",
  "Installation",
  "Logistics",
  "Other",
]);

export const quotationStatusEnum = pgEnum("quotation_status", [
  "Draft",
  "Submitted",
  "Superseded",
  "Final",
]);

const auditTimestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
};

export const financialYears = pgTable(
  "financial_years",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    label: varchar("label", { length: 10 }).notNull().unique(),
    startsOn: date("starts_on", { mode: "string" }).notNull(),
    endsOn: date("ends_on", { mode: "string" }).notNull(),
    nextJobNumber: integer("next_job_number").default(1).notNull(),
    isCurrent: boolean("is_current").default(false).notNull(),
    ...auditTimestamps,
  },
  (table) => [
    check(
      "financial_year_dates_valid",
      sql`${table.endsOn} >= ${table.startsOn}`,
    ),
    check(
      "financial_year_next_job_number_positive",
      sql`${table.nextJobNumber} > 0`,
    ),
  ],
);

export const internalUsers = pgTable("internal_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: varchar("display_name", { length: 160 }).notNull().unique(),
  active: boolean("active").default(true).notNull(),
  capabilities: text("capabilities")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  authSubject: varchar("auth_subject", { length: 255 }).unique(),
  ...auditTimestamps,
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    financialYearId: uuid("financial_year_id")
      .notNull()
      .references(() => financialYears.id, { onDelete: "restrict" }),
    jobCode: varchar("job_code", { length: 24 }).notNull(),
    projectName: varchar("project_name", { length: 255 }),
    brand: varchar("brand", { length: 255 }),
    projectType: projectTypeEnum("project_type"),
    leadUserId: uuid("lead_user_id").references(() => internalUsers.id, {
      onDelete: "restrict",
    }),
    projectManagerUserId: uuid("project_manager_user_id").references(
      () => internalUsers.id,
      { onDelete: "restrict" },
    ),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => internalUsers.id, { onDelete: "restrict" }),
    siteAddress: text("site_address"),
    city: varchar("city", { length: 160 }),
    clientPocName: varchar("client_poc_name", { length: 160 }),
    clientPocEmail: varchar("client_poc_email", { length: 320 }),
    clientPocPhone: varchar("client_poc_phone", { length: 40 }),
    projectStatus: projectStatusEnum("project_status")
      .default("Quotation")
      .notNull(),
    lifecycleState: projectLifecycleEnum("lifecycle_state")
      .default("Draft")
      .notNull(),
    notes: text("notes"),
    activatedAt: timestamp("activated_at", {
      withTimezone: true,
      mode: "date",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    closedAt: timestamp("closed_at", { withTimezone: true, mode: "date" }),
    ...auditTimestamps,
  },
  (table) => [
    unique("projects_financial_year_job_code_unique").on(
      table.financialYearId,
      table.jobCode,
    ),
    check("projects_job_code_format", sql`${table.jobCode} ~ '^GDS[0-9]{3,}$'`),
  ],
);

export const clientPurchaseOrders = pgTable(
  "client_purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    poNumber: varchar("po_number", { length: 120 }).notNull(),
    poDate: date("po_date", { mode: "string" }).notNull(),
    poAmount: numeric("po_amount", { precision: 18, scale: 2 }).notNull(),
    poDocumentLink: text("po_document_link"),
    notes: text("notes"),
    status: clientPurchaseOrderStatusEnum("status").default("Active").notNull(),
    ...auditTimestamps,
  },
  (table) => [
    index("client_purchase_orders_project_id_index").on(table.projectId),
    check("client_purchase_orders_amount_positive", sql`${table.poAmount} > 0`),
  ],
);

export const projectCostingRequirements = pgTable(
  "project_costing_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    requirementReceivedDate: date("requirement_received_date", {
      mode: "string",
    }),
    requirementBoqLink: text("requirement_boq_link"),
    scopeNotes: text("scope_notes"),
    costingStatus: costingWorkflowStatusEnum("costing_status")
      .default("Not Started")
      .notNull(),
    ...auditTimestamps,
  },
  (table) => [
    unique("project_costing_requirements_project_id_unique").on(
      table.projectId,
    ),
  ],
);

export const projectCostingEntries = pgTable(
  "project_costing_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    workCategory: costingWorkCategoryEnum("work_category").notNull(),
    costingSource: costingSourceEnum("costing_source").notNull(),
    vendorParty: varchar("vendor_party", { length: 255 }),
    costAmount: numeric("cost_amount", { precision: 18, scale: 2 }).notNull(),
    costingLink: text("costing_link"),
    status: costingEntryStatusEnum("status").default("Awaiting").notNull(),
    notes: text("notes"),
    ...auditTimestamps,
  },
  (table) => [
    index("project_costing_entries_project_id_index").on(table.projectId),
    check(
      "project_costing_entries_amount_positive",
      sql`${table.costAmount} > 0`,
    ),
  ],
);

export const projectQuotationVersions = pgTable(
  "project_quotation_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    quotationDate: date("quotation_date", { mode: "string" }).notNull(),
    quotationAmount: numeric("quotation_amount", {
      precision: 18,
      scale: 2,
    }).notNull(),
    quotationLink: text("quotation_link"),
    status: quotationStatusEnum("status").default("Draft").notNull(),
    notes: text("notes"),
    ...auditTimestamps,
  },
  (table) => [
    unique("project_quotation_versions_project_version_unique").on(
      table.projectId,
      table.versionNumber,
    ),
    uniqueIndex("project_quotation_versions_one_final_per_project")
      .on(table.projectId)
      .where(sql`${table.status} = 'Final'`),
    index("project_quotation_versions_project_id_index").on(table.projectId),
    check(
      "project_quotation_versions_version_positive",
      sql`${table.versionNumber} > 0`,
    ),
    check(
      "project_quotation_versions_amount_positive",
      sql`${table.quotationAmount} > 0`,
    ),
  ],
);

export type FinancialYear = typeof financialYears.$inferSelect;
export type InternalUser = typeof internalUsers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ClientPurchaseOrder = typeof clientPurchaseOrders.$inferSelect;
export type NewClientPurchaseOrder = typeof clientPurchaseOrders.$inferInsert;
export type ProjectCostingRequirement =
  typeof projectCostingRequirements.$inferSelect;
export type ProjectCostingEntry = typeof projectCostingEntries.$inferSelect;
export type ProjectQuotationVersion =
  typeof projectQuotationVersions.$inferSelect;
