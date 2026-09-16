import "server-only";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { financialYears, projects } from "@/db/schema";
import {
  createProjectCreationService,
  formatJobCode,
  type CreateProjectDraftInput,
  type ProjectCreationStore,
} from "./project-domain";

function currentUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

const drizzleProjectStore: ProjectCreationStore = {
  async createDraftWithReservedJobCode(input: CreateProjectDraftInput) {
    const effectiveDate = input.effectiveDate ?? currentUtcDate();

    return db.transaction(async (transaction) => {
      const [financialYear] = await transaction
        .select({ id: financialYears.id })
        .from(financialYears)
        .where(
          and(
            lte(financialYears.startsOn, effectiveDate),
            gte(financialYears.endsOn, effectiveDate),
          ),
        )
        .limit(1);

      if (!financialYear) {
        throw new Error(`No Financial Year contains ${effectiveDate}.`);
      }

      const [reservation] = await transaction
        .update(financialYears)
        .set({
          nextJobNumber: sql`${financialYears.nextJobNumber} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(financialYears.id, financialYear.id))
        .returning({
          reservedNumber: sql<number>`${financialYears.nextJobNumber} - 1`,
        });

      if (!reservation) throw new Error("Job Code reservation failed.");

      const [project] = await transaction
        .insert(projects)
        .values({
          financialYearId: financialYear.id,
          jobCode: formatJobCode(Number(reservation.reservedNumber)),
          createdByUserId: input.createdByUserId,
          projectName: input.projectName,
          brand: input.brand,
          projectType: input.projectType,
          leadUserId: input.leadUserId,
          projectManagerUserId: input.projectManagerUserId,
          projectStatus: input.projectStatus ?? "Quotation",
          siteAddress: input.siteAddress,
          city: input.city,
          clientPocName: input.clientPocName,
          clientPocEmail: input.clientPocEmail,
          clientPocPhone: input.clientPocPhone,
          notes: input.notes,
        })
        .returning();

      if (!project) throw new Error("Project Draft creation failed.");
      return project;
    });
  },

  async findProjectById(projectId) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    return project ?? null;
  },

  async activateDraft(projectId, activatedAt) {
    const [project] = await db
      .update(projects)
      .set({
        lifecycleState: "Active",
        activatedAt,
        updatedAt: activatedAt,
      })
      .where(
        and(eq(projects.id, projectId), eq(projects.lifecycleState, "Draft")),
      )
      .returning();

    if (!project) throw new Error("Project Draft could not be activated.");
    return project;
  },
};

export const projectCreationService =
  createProjectCreationService(drizzleProjectStore);
