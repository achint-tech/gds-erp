import "server-only";

import { and, desc, eq, inArray, max, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  projectCostingEntries,
  projectCostingRequirements,
  projectQuotationVersions,
  projects,
} from "@/db/schema";
import {
  createCostingQuotationService,
  type CostingQuotationStore,
} from "./costing-domain";

const drizzleCostingQuotationStore: CostingQuotationStore = {
  async getRequirement(projectId) {
    const [requirement] = await db
      .select()
      .from(projectCostingRequirements)
      .where(eq(projectCostingRequirements.projectId, projectId))
      .limit(1);
    return requirement ?? null;
  },

  async saveRequirement(input) {
    const [requirement] = await db
      .insert(projectCostingRequirements)
      .values(input)
      .onConflictDoUpdate({
        target: projectCostingRequirements.projectId,
        set: {
          requirementReceivedDate: input.requirementReceivedDate,
          requirementBoqLink: input.requirementBoqLink,
          scopeNotes: input.scopeNotes,
          costingStatus: input.costingStatus,
          updatedAt: new Date(),
        },
      })
      .returning();
    if (!requirement) throw new Error("Requirement/BOQ save failed.");
    return requirement;
  },

  listEntries(projectId) {
    return db
      .select()
      .from(projectCostingEntries)
      .where(eq(projectCostingEntries.projectId, projectId))
      .orderBy(desc(projectCostingEntries.createdAt));
  },

  async createEntry(input) {
    const [entry] = await db
      .insert(projectCostingEntries)
      .values(input)
      .returning();
    if (!entry) throw new Error("Costing entry creation failed.");
    return entry;
  },

  async updateEntry(id, input) {
    const [entry] = await db
      .update(projectCostingEntries)
      .set({
        workCategory: input.workCategory,
        costingSource: input.costingSource,
        vendorParty: input.vendorParty,
        costAmount: input.costAmount,
        costingLink: input.costingLink,
        status: input.status,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectCostingEntries.id, id),
          eq(projectCostingEntries.projectId, input.projectId),
          ne(projectCostingEntries.status, "Cancelled"),
        ),
      )
      .returning();
    if (!entry) throw new Error("Cancelled costing entries cannot be edited.");
    return entry;
  },

  async cancelEntry(id, projectId) {
    const [entry] = await db
      .update(projectCostingEntries)
      .set({ status: "Cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(projectCostingEntries.id, id),
          eq(projectCostingEntries.projectId, projectId),
          ne(projectCostingEntries.status, "Cancelled"),
        ),
      )
      .returning();
    if (!entry) throw new Error("Costing entry could not be cancelled.");
    return entry;
  },

  listQuotations(projectId) {
    return db
      .select()
      .from(projectQuotationVersions)
      .where(eq(projectQuotationVersions.projectId, projectId))
      .orderBy(desc(projectQuotationVersions.versionNumber));
  },

  createQuotationVersion(input) {
    return db.transaction(async (transaction) => {
      await transaction.execute(
        sql`select ${projects.id} from ${projects} where ${projects.id} = ${input.projectId} for update`,
      );
      const [current] = await transaction
        .select({ latest: max(projectQuotationVersions.versionNumber) })
        .from(projectQuotationVersions)
        .where(eq(projectQuotationVersions.projectId, input.projectId));
      const versionNumber = (current?.latest ?? 0) + 1;

      await transaction
        .update(projectQuotationVersions)
        .set({ status: "Superseded", updatedAt: new Date() })
        .where(
          and(
            eq(projectQuotationVersions.projectId, input.projectId),
            inArray(projectQuotationVersions.status, [
              "Draft",
              "Submitted",
              "Final",
            ]),
          ),
        );

      const [quotation] = await transaction
        .insert(projectQuotationVersions)
        .values({ ...input, versionNumber })
        .returning();
      if (!quotation) throw new Error("Quotation version creation failed.");
      return quotation;
    });
  },

  updateDraftQuotation(id, input) {
    return db.transaction(async (transaction) => {
      await transaction.execute(
        sql`select ${projects.id} from ${projects} where ${projects.id} = ${input.projectId} for update`,
      );
      if (input.status === "Final") {
        await transaction
          .update(projectQuotationVersions)
          .set({ status: "Superseded", updatedAt: new Date() })
          .where(
            and(
              eq(projectQuotationVersions.projectId, input.projectId),
              eq(projectQuotationVersions.status, "Final"),
              ne(projectQuotationVersions.id, id),
            ),
          );
      }
      const [quotation] = await transaction
        .update(projectQuotationVersions)
        .set({
          quotationDate: input.quotationDate,
          quotationAmount: input.quotationAmount,
          quotationLink: input.quotationLink,
          status: input.status,
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectQuotationVersions.id, id),
            eq(projectQuotationVersions.projectId, input.projectId),
            eq(projectQuotationVersions.status, "Draft"),
          ),
        )
        .returning();
      if (!quotation) {
        throw new Error("Only a Draft quotation can be edited.");
      }
      return quotation;
    });
  },

  markQuotationFinal(id, projectId) {
    return db.transaction(async (transaction) => {
      await transaction.execute(
        sql`select ${projects.id} from ${projects} where ${projects.id} = ${projectId} for update`,
      );
      await transaction
        .update(projectQuotationVersions)
        .set({ status: "Superseded", updatedAt: new Date() })
        .where(
          and(
            eq(projectQuotationVersions.projectId, projectId),
            eq(projectQuotationVersions.status, "Final"),
            ne(projectQuotationVersions.id, id),
          ),
        );
      const [quotation] = await transaction
        .update(projectQuotationVersions)
        .set({ status: "Final", updatedAt: new Date() })
        .where(
          and(
            eq(projectQuotationVersions.id, id),
            eq(projectQuotationVersions.projectId, projectId),
            eq(projectQuotationVersions.status, "Submitted"),
          ),
        )
        .returning();
      if (!quotation) {
        throw new Error("Only a Submitted quotation can be marked Final.");
      }
      return quotation;
    });
  },
};

export const costingQuotationService = createCostingQuotationService(
  drizzleCostingQuotationStore,
);
