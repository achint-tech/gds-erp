import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clientPurchaseOrders } from "@/db/schema";
import {
  createClientPurchaseOrderService,
  type ClientPurchaseOrderStore,
} from "./client-po-domain";

const drizzleClientPurchaseOrderStore: ClientPurchaseOrderStore = {
  list(projectId) {
    return db
      .select()
      .from(clientPurchaseOrders)
      .where(eq(clientPurchaseOrders.projectId, projectId))
      .orderBy(
        desc(clientPurchaseOrders.poDate),
        desc(clientPurchaseOrders.createdAt),
      );
  },

  async create(input) {
    const [purchaseOrder] = await db
      .insert(clientPurchaseOrders)
      .values(input)
      .returning();
    if (!purchaseOrder) throw new Error("Client PO creation failed.");
    return purchaseOrder;
  },

  async update(id, input) {
    const [purchaseOrder] = await db
      .update(clientPurchaseOrders)
      .set({
        poNumber: input.poNumber,
        poDate: input.poDate,
        poAmount: input.poAmount,
        poDocumentLink: input.poDocumentLink,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clientPurchaseOrders.id, id),
          eq(clientPurchaseOrders.projectId, input.projectId),
          eq(clientPurchaseOrders.status, "Active"),
        ),
      )
      .returning();
    if (!purchaseOrder) {
      throw new Error("Only an existing Active Client PO can be edited.");
    }
    return purchaseOrder;
  },

  async cancel(id, projectId) {
    const [purchaseOrder] = await db
      .update(clientPurchaseOrders)
      .set({ status: "Cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(clientPurchaseOrders.id, id),
          eq(clientPurchaseOrders.projectId, projectId),
          eq(clientPurchaseOrders.status, "Active"),
        ),
      )
      .returning();
    if (!purchaseOrder) {
      throw new Error("Only an existing Active Client PO can be cancelled.");
    }
    return purchaseOrder;
  },
};

export const clientPurchaseOrderService = createClientPurchaseOrderService(
  drizzleClientPurchaseOrderStore,
);
