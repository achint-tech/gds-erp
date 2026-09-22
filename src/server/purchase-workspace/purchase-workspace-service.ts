import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { internalUsers, projectPurchaseWorkspaces } from "@/db/schema";
import {
  createPurchaseWorkspaceService,
  type PurchaseWorkspaceStore,
} from "./purchase-workspace-domain";
const owner = alias(internalUsers, "purchase_owner");
const selection = {
  id: projectPurchaseWorkspaces.id,
  projectId: projectPurchaseWorkspaces.projectId,
  purchaseOwnerUserId: projectPurchaseWorkspaces.purchaseOwnerUserId,
  purchaseOwner: owner.displayName,
  status: projectPurchaseWorkspaces.status,
  purchaseSheetLink: projectPurchaseWorkspaces.purchaseSheetLink,
  notes: projectPurchaseWorkspaces.notes,
  createdAt: projectPurchaseWorkspaces.createdAt,
  updatedAt: projectPurchaseWorkspaces.updatedAt,
};
const store: PurchaseWorkspaceStore = {
  listActiveOwners: () =>
    db
      .select({ id: internalUsers.id, displayName: internalUsers.displayName })
      .from(internalUsers)
      .where(eq(internalUsers.active, true))
      .orderBy(internalUsers.displayName),
  async isActiveOwner(id) {
    const [user] = await db
      .select({ id: internalUsers.id })
      .from(internalUsers)
      .where(and(eq(internalUsers.id, id), eq(internalUsers.active, true)))
      .limit(1);
    return Boolean(user);
  },
  async get(projectId) {
    const [workspace] = await db
      .select(selection)
      .from(projectPurchaseWorkspaces)
      .leftJoin(
        owner,
        eq(projectPurchaseWorkspaces.purchaseOwnerUserId, owner.id),
      )
      .where(eq(projectPurchaseWorkspaces.projectId, projectId))
      .limit(1);
    return workspace ?? null;
  },
  async upsert(input) {
    await db
      .insert(projectPurchaseWorkspaces)
      .values(input)
      .onConflictDoUpdate({
        target: projectPurchaseWorkspaces.projectId,
        set: {
          purchaseOwnerUserId: input.purchaseOwnerUserId,
          status: input.status,
          purchaseSheetLink: input.purchaseSheetLink,
          notes: input.notes,
          updatedAt: new Date(),
        },
      });
    const workspace = await this.get(input.projectId);
    if (!workspace) throw new Error("Purchase workspace save failed.");
    return workspace;
  },
};
export const purchaseWorkspaceService = createPurchaseWorkspaceService(store);
