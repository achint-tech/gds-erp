import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { internalUsers, printRequests } from "@/db/schema";
import {
  createPrintRequestService,
  type PrintRequestStore,
} from "./print-request-domain";
const requester = alias(internalUsers, "print_requester");
const selection = {
  id: printRequests.id,
  projectId: printRequests.projectId,
  printType: printRequests.printType,
  description: printRequests.description,
  width: printRequests.width,
  height: printRequests.height,
  sizeUnit: printRequests.sizeUnit,
  quantity: printRequests.quantity,
  location: printRequests.location,
  artworkLink: printRequests.artworkLink,
  requestedByUserId: printRequests.requestedByUserId,
  requestedBy: requester.displayName,
  requiredByDate: printRequests.requiredByDate,
  vendorName: printRequests.vendorName,
  status: printRequests.status,
  notes: printRequests.notes,
  createdAt: printRequests.createdAt,
  updatedAt: printRequests.updatedAt,
};
const store: PrintRequestStore = {
  listActiveRequesters: () =>
    db
      .select({ id: internalUsers.id, displayName: internalUsers.displayName })
      .from(internalUsers)
      .where(eq(internalUsers.active, true))
      .orderBy(internalUsers.displayName),
  async isActiveRequester(id) {
    const [user] = await db
      .select({ id: internalUsers.id })
      .from(internalUsers)
      .where(and(eq(internalUsers.id, id), eq(internalUsers.active, true)))
      .limit(1);
    return Boolean(user);
  },
  list(projectId) {
    return db
      .select(selection)
      .from(printRequests)
      .innerJoin(requester, eq(printRequests.requestedByUserId, requester.id))
      .where(eq(printRequests.projectId, projectId))
      .orderBy(desc(printRequests.createdAt));
  },
  async create(input) {
    const [row] = await db
      .insert(printRequests)
      .values(input)
      .returning({ id: printRequests.id });
    if (!row) throw new Error("Print Request creation failed.");
    return (await this.list(input.projectId)).find(({ id }) => id === row.id)!;
  },
  async update(id, input) {
    const [row] = await db
      .update(printRequests)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(
          eq(printRequests.id, id),
          eq(printRequests.projectId, input.projectId),
          inArray(printRequests.status, [
            "Raised",
            "Sent to Vendor",
            "In Production",
          ]),
        ),
      )
      .returning({ id: printRequests.id });
    if (!row) throw new Error("Historical requests cannot be edited.");
    return (await this.list(input.projectId)).find((item) => item.id === id)!;
  },
};
export const printRequestService = createPrintRequestService(store);
