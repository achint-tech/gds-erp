import "server-only";

import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { financialYears, internalUsers, projects } from "@/db/schema";
import {
  classifyProjectUsers,
  createProjectCreationService,
  formatJobCode,
  type CreateProjectDraftInput,
  type ProjectCreationStore,
  type UpdateProjectDraftInput,
} from "./project-domain";

function currentUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export type InternalUserOption = {
  id: string;
  displayName: string;
};

export type ProjectFormOptions = {
  leads: InternalUserOption[];
  projectManagers: InternalUserOption[];
  creators: InternalUserOption[];
};

export type PersistedProjectView = {
  id: string;
  financialYear: string;
  jobCode: string;
  projectName: string | null;
  brand: string | null;
  projectType: (typeof projects.$inferSelect)["projectType"];
  leadUserId: string | null;
  projectLead: string | null;
  projectManagerUserId: string | null;
  projectManager: string | null;
  createdByUserId: string;
  createdBy: string;
  projectStatus: (typeof projects.$inferSelect)["projectStatus"];
  lifecycleState: (typeof projects.$inferSelect)["lifecycleState"];
  siteAddress: string | null;
  city: string | null;
  clientPocName: string | null;
  clientPocEmail: string | null;
  clientPocPhone: string | null;
  notes: string | null;
};

async function assertEligibleUsers(
  input: Pick<
    CreateProjectDraftInput,
    "createdByUserId" | "leadUserId" | "projectManagerUserId"
  >,
) {
  const options = await getProjectFormOptions();
  const creatorIds = new Set(options.creators.map(({ id }) => id));
  const leadIds = new Set(options.leads.map(({ id }) => id));
  const managerIds = new Set(options.projectManagers.map(({ id }) => id));

  if (!creatorIds.has(input.createdByUserId)) {
    throw new Error("Created By must be an active Project Lead or Manager.");
  }
  if (input.leadUserId && !leadIds.has(input.leadUserId)) {
    throw new Error("Project Lead is not an eligible active internal user.");
  }
  if (
    input.projectManagerUserId &&
    !managerIds.has(input.projectManagerUserId)
  ) {
    throw new Error("Project Manager is not an eligible active internal user.");
  }
}

const drizzleProjectStore: ProjectCreationStore = {
  async createDraftWithReservedJobCode(input: CreateProjectDraftInput) {
    const effectiveDate = input.effectiveDate ?? currentUtcDate();
    await assertEligibleUsers(input);

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

  async updateDraft(projectId, input: UpdateProjectDraftInput) {
    const existing = await this.findProjectById(projectId);
    if (!existing) throw new Error("Project Draft was not found.");
    if (existing.lifecycleState !== "Draft") {
      throw new Error("Only a Draft project can be edited.");
    }

    await assertEligibleUsers({
      createdByUserId: existing.createdByUserId,
      leadUserId: input.leadUserId,
      projectManagerUserId: input.projectManagerUserId,
    });

    const [project] = await db
      .update(projects)
      .set({
        projectName: input.projectName,
        brand: input.brand,
        projectType: input.projectType,
        leadUserId: input.leadUserId,
        projectManagerUserId: input.projectManagerUserId,
        projectStatus: input.projectStatus,
        siteAddress: input.siteAddress,
        city: input.city,
        clientPocName: input.clientPocName,
        clientPocEmail: input.clientPocEmail,
        clientPocPhone: input.clientPocPhone,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(
        and(eq(projects.id, projectId), eq(projects.lifecycleState, "Draft")),
      )
      .returning();

    if (!project) throw new Error("Project Draft update failed.");
    return project;
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

export async function getProjectFormOptions(): Promise<ProjectFormOptions> {
  const users = await db
    .select({
      id: internalUsers.id,
      displayName: internalUsers.displayName,
      capabilities: internalUsers.capabilities,
    })
    .from(internalUsers)
    .where(eq(internalUsers.active, true))
    .orderBy(internalUsers.displayName);

  return classifyProjectUsers(users);
}

const leadUser = alias(internalUsers, "lead_user");
const managerUser = alias(internalUsers, "manager_user");
const creatorUser = alias(internalUsers, "creator_user");

const projectViewSelection = {
  id: projects.id,
  financialYear: financialYears.label,
  jobCode: projects.jobCode,
  projectName: projects.projectName,
  brand: projects.brand,
  projectType: projects.projectType,
  leadUserId: projects.leadUserId,
  projectLead: leadUser.displayName,
  projectManagerUserId: projects.projectManagerUserId,
  projectManager: managerUser.displayName,
  createdByUserId: projects.createdByUserId,
  createdBy: creatorUser.displayName,
  projectStatus: projects.projectStatus,
  lifecycleState: projects.lifecycleState,
  siteAddress: projects.siteAddress,
  city: projects.city,
  clientPocName: projects.clientPocName,
  clientPocEmail: projects.clientPocEmail,
  clientPocPhone: projects.clientPocPhone,
  notes: projects.notes,
};

function projectViewQuery() {
  return db
    .select(projectViewSelection)
    .from(projects)
    .innerJoin(financialYears, eq(projects.financialYearId, financialYears.id))
    .leftJoin(leadUser, eq(projects.leadUserId, leadUser.id))
    .leftJoin(managerUser, eq(projects.projectManagerUserId, managerUser.id))
    .innerJoin(creatorUser, eq(projects.createdByUserId, creatorUser.id));
}

export async function listPersistedProjects() {
  return projectViewQuery()
    .where(inArray(projects.lifecycleState, ["Draft", "Active"]))
    .orderBy(projects.createdAt);
}

export async function getPersistedProject(projectId: string) {
  const [project] = await projectViewQuery()
    .where(eq(projects.id, projectId))
    .limit(1);
  return project ?? null;
}
