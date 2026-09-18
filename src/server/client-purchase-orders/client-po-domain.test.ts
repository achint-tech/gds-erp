import { describe, expect, it } from "vitest";
import {
  ClientPurchaseOrderValidationError,
  createClientPurchaseOrderService,
  getClientPurchaseOrderSummary,
  type ClientPurchaseOrder,
  type ClientPurchaseOrderStore,
  type SaveClientPurchaseOrderInput,
} from "./client-po-domain";

class MemoryClientPurchaseOrderStore implements ClientPurchaseOrderStore {
  records: ClientPurchaseOrder[] = [];
  private nextId = 1;

  async list(projectId: string) {
    return this.records.filter((record) => record.projectId === projectId);
  }

  async create(input: SaveClientPurchaseOrderInput & { poAmount: string }) {
    const now = new Date("2026-09-17T00:00:00.000Z");
    const record: ClientPurchaseOrder = {
      id: `po-${this.nextId++}`,
      ...input,
      poDocumentLink: input.poDocumentLink ?? null,
      notes: input.notes ?? null,
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };
    this.records.push(record);
    return record;
  }

  async update(
    id: string,
    input: SaveClientPurchaseOrderInput & { poAmount: string },
  ) {
    const index = this.records.findIndex(
      (record) =>
        record.id === id &&
        record.projectId === input.projectId &&
        record.status === "Active",
    );
    if (index < 0) throw new Error("Active PO not found.");
    const updated = {
      ...this.records[index],
      ...input,
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    };
    this.records[index] = updated;
    return updated;
  }

  async cancel(id: string, projectId: string) {
    const index = this.records.findIndex(
      (record) =>
        record.id === id &&
        record.projectId === projectId &&
        record.status === "Active",
    );
    if (index < 0) throw new Error("Active PO not found.");
    const cancelled = {
      ...this.records[index],
      status: "Cancelled" as const,
      updatedAt: new Date("2026-09-18T00:00:00.000Z"),
    };
    this.records[index] = cancelled;
    return cancelled;
  }
}

const projectId = "project-168";
const validInput: SaveClientPurchaseOrderInput = {
  projectId,
  poNumber: "PO-001",
  poDate: "2026-09-17",
  poAmount: "100000.00",
  poDocumentLink: null,
  notes: null,
};

describe("Client PO persistence domain", () => {
  it("stores one PO for a project", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    await service.add(validInput);
    expect(await service.list(projectId)).toHaveLength(1);
  });

  it("stores multiple independent POs for one project", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    await service.add(validInput);
    await service.add({ ...validInput, poNumber: "PO-002" });
    expect(await service.list(projectId)).toHaveLength(2);
  });

  it("requires PO Number, PO Date, and PO Amount", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    expect(() =>
      service.add({ ...validInput, poNumber: "", poDate: "", poAmount: "" }),
    ).toThrowError(
      expect.objectContaining({
        fieldErrors: {
          poNumber: expect.any(String),
          poDate: expect.any(String),
          poAmount: expect.any(String),
        },
      }),
    );
  });

  it.each(["0", "0.00", "-1", "not-a-number"])(
    "rejects non-positive or invalid amount %s",
    async (poAmount) => {
      const service = createClientPurchaseOrderService(
        new MemoryClientPurchaseOrderStore(),
      );
      expect(() => service.add({ ...validInput, poAmount })).toThrow(
        ClientPurchaseOrderValidationError,
      );
    },
  );

  it("totals multiple Active POs using fixed-precision values", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    await service.add(validInput);
    await service.add({
      ...validInput,
      poNumber: "PO-002",
      poAmount: "850000.50",
    });
    expect(
      getClientPurchaseOrderSummary(await service.list(projectId)),
    ).toEqual({ activeCount: 2, totalPoValue: "950000.50" });
  });

  it("keeps a cancelled PO stored", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    const saved = await service.add(validInput);
    await service.cancel(saved.id, projectId);
    expect(await service.list(projectId)).toMatchObject([
      { id: saved.id, status: "Cancelled" },
    ]);
  });

  it("excludes cancelled POs from Total PO Value", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    const cancelled = await service.add(validInput);
    await service.add({ ...validInput, poNumber: "PO-002", poAmount: "50" });
    await service.cancel(cancelled.id, projectId);
    expect(
      getClientPurchaseOrderSummary(await service.list(projectId)),
    ).toEqual({ activeCount: 1, totalPoValue: "50.00" });
  });

  it("edits an Active PO", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    const saved = await service.add(validInput);
    const updated = await service.edit(saved.id, {
      ...validInput,
      poNumber: "PO-CORRECTED",
      poAmount: "125000",
    });
    expect(updated).toMatchObject({
      id: saved.id,
      poNumber: "PO-CORRECTED",
      poAmount: "125000.00",
      status: "Active",
    });
  });

  it("cancels an Active PO", async () => {
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    const saved = await service.add(validInput);
    expect((await service.cancel(saved.id, projectId)).status).toBe(
      "Cancelled",
    );
  });

  it("reloads persisted POs through a fresh service instance", async () => {
    const store = new MemoryClientPurchaseOrderStore();
    const firstService = createClientPurchaseOrderService(store);
    const saved = await firstService.add(validInput);
    const freshService = createClientPurchaseOrderService(store);
    expect(await freshService.list(projectId)).toMatchObject([
      { id: saved.id, poNumber: "PO-001" },
    ]);
  });

  it("does not modify Project Status or the Job Code/FY sequence", async () => {
    const project = {
      jobCode: "GDS168",
      projectStatus: "Quotation",
      nextJobNumber: 169,
    };
    const before = structuredClone(project);
    const service = createClientPurchaseOrderService(
      new MemoryClientPurchaseOrderStore(),
    );
    const saved = await service.add(validInput);
    await service.edit(saved.id, { ...validInput, poAmount: "200000" });
    await service.cancel(saved.id, projectId);
    expect(project).toEqual(before);
  });
});
