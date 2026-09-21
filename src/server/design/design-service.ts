import "server-only";

import { alias } from "drizzle-orm/pg-core";
import {
  and,
  arrayContains,
  desc,
  eq,
  inArray,
  max,
  ne,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { designTasks, designVersions, internalUsers } from "@/db/schema";
import {
  createDesignService,
  DESIGN_ELIGIBILITY_CAPABILITY,
  type DesignStore,
} from "./design-domain";

const assignee = alias(internalUsers, "design_assignee");
const taskSelection = {
  id: designTasks.id,
  projectId: designTasks.projectId,
  designType: designTasks.designType,
  taskName: designTasks.taskName,
  assignedToUserId: designTasks.assignedToUserId,
  assignedTo: assignee.displayName,
  targetDate: designTasks.targetDate,
  status: designTasks.status,
  waitingFor: designTasks.waitingFor,
  notes: designTasks.notes,
  createdAt: designTasks.createdAt,
  updatedAt: designTasks.updatedAt,
};

const store: DesignStore = {
  listEligibleAssignees() {
    return db
      .select({ id: internalUsers.id, displayName: internalUsers.displayName })
      .from(internalUsers)
      .where(
        and(
          eq(internalUsers.active, true),
          arrayContains(internalUsers.capabilities, [
            DESIGN_ELIGIBILITY_CAPABILITY,
          ]),
        ),
      )
      .orderBy(internalUsers.displayName);
  },

  async isEligibleAssignee(userId) {
    const [user] = await db
      .select({ id: internalUsers.id })
      .from(internalUsers)
      .where(
        and(
          eq(internalUsers.id, userId),
          eq(internalUsers.active, true),
          arrayContains(internalUsers.capabilities, [
            DESIGN_ELIGIBILITY_CAPABILITY,
          ]),
        ),
      )
      .limit(1);
    return Boolean(user);
  },

  listTasks(projectId) {
    return db
      .select(taskSelection)
      .from(designTasks)
      .innerJoin(assignee, eq(designTasks.assignedToUserId, assignee.id))
      .where(eq(designTasks.projectId, projectId))
      .orderBy(designTasks.targetDate, designTasks.createdAt);
  },

  async createTask(input) {
    const [created] = await db.insert(designTasks).values(input).returning();
    if (!created) throw new Error("Design Task creation failed.");
    const [task] = await db
      .select(taskSelection)
      .from(designTasks)
      .innerJoin(assignee, eq(designTasks.assignedToUserId, assignee.id))
      .where(eq(designTasks.id, created.id));
    if (!task) throw new Error("Design Task could not be loaded.");
    return task;
  },

  async updateTask(id, input) {
    const [updated] = await db
      .update(designTasks)
      .set({
        designType: input.designType,
        taskName: input.taskName,
        assignedToUserId: input.assignedToUserId,
        targetDate: input.targetDate,
        status: input.status,
        waitingFor: input.waitingFor,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(
        and(eq(designTasks.id, id), eq(designTasks.projectId, input.projectId)),
      )
      .returning({ id: designTasks.id });
    if (!updated) throw new Error("Design Task update failed.");
    const [task] = await db
      .select(taskSelection)
      .from(designTasks)
      .innerJoin(assignee, eq(designTasks.assignedToUserId, assignee.id))
      .where(eq(designTasks.id, id));
    if (!task) throw new Error("Design Task could not be loaded.");
    return task;
  },

  listVersions(projectId) {
    return db
      .select({
        id: designVersions.id,
        designTaskId: designVersions.designTaskId,
        versionNumber: designVersions.versionNumber,
        drawingLink: designVersions.drawingLink,
        submittedDate: designVersions.submittedDate,
        status: designVersions.status,
        revisionNotes: designVersions.revisionNotes,
        createdAt: designVersions.createdAt,
        updatedAt: designVersions.updatedAt,
      })
      .from(designVersions)
      .innerJoin(designTasks, eq(designVersions.designTaskId, designTasks.id))
      .where(eq(designTasks.projectId, projectId))
      .orderBy(desc(designVersions.versionNumber));
  },

  createVersion(input) {
    return db.transaction(async (transaction) => {
      await transaction.execute(
        sql`select ${designTasks.id} from ${designTasks} where ${designTasks.id} = ${input.designTaskId} for update`,
      );
      const [current] = await transaction
        .select({ latest: max(designVersions.versionNumber) })
        .from(designVersions)
        .where(eq(designVersions.designTaskId, input.designTaskId));
      const versionNumber = (current?.latest ?? 0) + 1;
      await transaction
        .update(designVersions)
        .set({ status: "Superseded", updatedAt: new Date() })
        .where(
          and(
            eq(designVersions.designTaskId, input.designTaskId),
            inArray(designVersions.status, [
              "Working",
              "Submitted",
              "Approved",
            ]),
          ),
        );
      const [version] = await transaction
        .insert(designVersions)
        .values({ ...input, versionNumber, status: "Working" })
        .returning();
      if (!version) throw new Error("Design version creation failed.");
      return version;
    });
  },

  async updateWorkingVersion(input) {
    const [version] = await db
      .update(designVersions)
      .set({
        drawingLink: input.drawingLink,
        revisionNotes: input.revisionNotes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(designVersions.id, input.id),
          eq(designVersions.designTaskId, input.designTaskId),
          eq(designVersions.status, "Working"),
        ),
      )
      .returning();
    if (!version) throw new Error("Only a Working version can be edited.");
    return version;
  },

  async submitVersion(id, designTaskId, submittedDate) {
    const [version] = await db
      .update(designVersions)
      .set({ status: "Submitted", submittedDate, updatedAt: new Date() })
      .where(
        and(
          eq(designVersions.id, id),
          eq(designVersions.designTaskId, designTaskId),
          eq(designVersions.status, "Working"),
        ),
      )
      .returning();
    if (!version) throw new Error("Only a Working version can be submitted.");
    return version;
  },

  approveVersion(id, designTaskId) {
    return db.transaction(async (transaction) => {
      await transaction.execute(
        sql`select ${designTasks.id} from ${designTasks} where ${designTasks.id} = ${designTaskId} for update`,
      );
      await transaction
        .update(designVersions)
        .set({ status: "Superseded", updatedAt: new Date() })
        .where(
          and(
            eq(designVersions.designTaskId, designTaskId),
            eq(designVersions.status, "Approved"),
            ne(designVersions.id, id),
          ),
        );
      const [version] = await transaction
        .update(designVersions)
        .set({ status: "Approved", updatedAt: new Date() })
        .where(
          and(
            eq(designVersions.id, id),
            eq(designVersions.designTaskId, designTaskId),
            eq(designVersions.status, "Submitted"),
          ),
        )
        .returning();
      if (!version)
        throw new Error("Only a Submitted version can be approved.");
      await transaction
        .update(designTasks)
        .set({ status: "Approved", waitingFor: null, updatedAt: new Date() })
        .where(eq(designTasks.id, designTaskId));
      return version;
    });
  },
};

export const designService = createDesignService(store);
