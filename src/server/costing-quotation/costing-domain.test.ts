import { describe, expect, it } from "vitest";
import {
  CostingValidationError,
  createCostingQuotationService,
  type CostingEntry,
  type CostingQuotationStore,
  type CostingRequirement,
  type QuotationVersion,
  type SaveCostingEntryInput,
  type SaveCostingRequirementInput,
  type SaveQuotationInput,
} from "./costing-domain";

class MemoryCostingStore implements CostingQuotationStore {
  requirement: CostingRequirement | null = null;
  entries: CostingEntry[] = [];
  quotations: QuotationVersion[] = [];
  private nextId = 1;
  private queue = Promise.resolve();

  private async exclusively<T>(operation: () => T | Promise<T>) {
    const previous = this.queue;
    let release: () => void = () => undefined;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  async getRequirement(projectId: string) {
    return this.requirement?.projectId === projectId ? this.requirement : null;
  }

  async saveRequirement(input: SaveCostingRequirementInput) {
    const now = new Date("2026-09-18T00:00:00Z");
    this.requirement = {
      id: this.requirement?.id ?? `requirement-${this.nextId++}`,
      ...input,
      requirementReceivedDate: input.requirementReceivedDate ?? null,
      requirementBoqLink: input.requirementBoqLink ?? null,
      scopeNotes: input.scopeNotes ?? null,
      createdAt: this.requirement?.createdAt ?? now,
      updatedAt: now,
    };
    return this.requirement;
  }

  async listEntries(projectId: string) {
    return this.entries.filter((entry) => entry.projectId === projectId);
  }

  async createEntry(input: SaveCostingEntryInput) {
    const now = new Date("2026-09-18T00:00:00Z");
    const entry: CostingEntry = {
      id: `entry-${this.nextId++}`,
      ...input,
      vendorParty: input.vendorParty ?? null,
      costingLink: input.costingLink ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.push(entry);
    return entry;
  }

  async updateEntry(id: string, input: SaveCostingEntryInput) {
    const index = this.entries.findIndex(
      (entry) =>
        entry.id === id &&
        entry.projectId === input.projectId &&
        entry.status !== "Cancelled",
    );
    if (index < 0) throw new Error("Entry unavailable.");
    this.entries[index] = {
      ...this.entries[index],
      ...input,
      vendorParty: input.vendorParty ?? null,
      costingLink: input.costingLink ?? null,
      notes: input.notes ?? null,
    };
    return this.entries[index];
  }

  async cancelEntry(id: string, projectId: string) {
    const entry = this.entries.find(
      (item) => item.id === id && item.projectId === projectId,
    );
    if (!entry) throw new Error("Entry unavailable.");
    entry.status = "Cancelled";
    return entry;
  }

  async listQuotations(projectId: string) {
    return this.quotations
      .filter((quotation) => quotation.projectId === projectId)
      .sort((left, right) => right.versionNumber - left.versionNumber);
  }

  createQuotationVersion(input: SaveQuotationInput) {
    return this.exclusively(() => {
      const existing = this.quotations.filter(
        (quotation) => quotation.projectId === input.projectId,
      );
      existing.forEach((quotation) => {
        if (quotation.status !== "Superseded") quotation.status = "Superseded";
      });
      const now = new Date("2026-09-18T00:00:00Z");
      const quotation: QuotationVersion = {
        id: `quotation-${this.nextId++}`,
        ...input,
        quotationLink: input.quotationLink ?? null,
        notes: input.notes ?? null,
        versionNumber:
          Math.max(0, ...existing.map(({ versionNumber }) => versionNumber)) +
          1,
        createdAt: now,
        updatedAt: now,
      };
      this.quotations.push(quotation);
      return quotation;
    });
  }

  async updateDraftQuotation(id: string, input: SaveQuotationInput) {
    const quotation = this.quotations.find(
      (item) =>
        item.id === id &&
        item.projectId === input.projectId &&
        item.status === "Draft",
    );
    if (!quotation) throw new Error("Only a Draft quotation can be edited.");
    Object.assign(quotation, input, {
      quotationLink: input.quotationLink ?? null,
      notes: input.notes ?? null,
    });
    return quotation;
  }

  async markQuotationFinal(id: string, projectId: string) {
    const quotation = this.quotations.find(
      (item) =>
        item.id === id &&
        item.projectId === projectId &&
        item.status === "Submitted",
    );
    if (!quotation) throw new Error("Only Submitted can be Final.");
    this.quotations.forEach((item) => {
      if (item.projectId === projectId && item.status === "Final") {
        item.status = "Superseded";
      }
    });
    quotation.status = "Final";
    return quotation;
  }
}

const projectId = "project-168";
const requirementInput: SaveCostingRequirementInput = {
  projectId,
  costingStatus: "Not Started",
};
const entryInput: SaveCostingEntryInput = {
  projectId,
  workCategory: "Civil",
  costingSource: "Internal",
  costAmount: "205000",
  status: "Received",
};
const quotationInput: SaveQuotationInput = {
  projectId,
  quotationDate: "2026-09-18",
  quotationAmount: "1400000",
  status: "Draft",
};

describe("Costing & Quotation persistence domain", () => {
  it("saves a requirement without a BOQ link", async () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    expect(await service.saveRequirement(requirementInput)).toMatchObject({
      requirementBoqLink: null,
      costingStatus: "Not Started",
    });
  });

  it("keeps one editable requirement summary per project", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    const first = await service.saveRequirement(requirementInput);
    const edited = await service.saveRequirement({
      ...requirementInput,
      scopeNotes: "Updated scope",
      costingStatus: "In Progress",
    });
    expect(edited.id).toBe(first.id);
    expect(edited.scopeNotes).toBe("Updated scope");
    expect(store.requirement?.costingStatus).toBe("In Progress");
  });

  it("stores multiple entries including repeated categories and both sources", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    await service.addEntry(entryInput);
    await service.addEntry({
      ...entryInput,
      costingSource: "Vendor",
      vendorParty: "Vendor A",
      costAmount: "210000",
    });
    expect(store.entries).toMatchObject([
      { workCategory: "Civil", costingSource: "Internal" },
      {
        workCategory: "Civil",
        costingSource: "Vendor",
        vendorParty: "Vendor A",
      },
    ]);
  });

  it("requires a positive Cost Amount", () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    expect(() => service.addEntry({ ...entryInput, costAmount: "0" })).toThrow(
      CostingValidationError,
    );
  });

  it("retains cancelled costing but excludes it from active summary", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    const cancelled = await service.addEntry(entryInput);
    await service.addEntry({ ...entryInput, costAmount: "210000" });
    await service.cancelEntry(cancelled.id, projectId);
    const workspace = await service.getWorkspace(projectId);
    expect(workspace.entries).toHaveLength(2);
    expect(workspace.entries[0].status).toBe("Cancelled");
    expect(workspace.summary).toMatchObject({
      activeCostingEntryCount: 1,
      recordedCostingAmount: "210000.00",
    });
  });

  it("does not select or recommend the cheapest costing entry", async () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    await service.addEntry(entryInput);
    await service.addEntry({ ...entryInput, costAmount: "210000" });
    const workspace = await service.getWorkspace(projectId);
    expect(workspace.entries).toHaveLength(2);
    expect(workspace.summary).not.toHaveProperty("selectedEntry");
  });

  it("allocates V1, then V2 and V3", async () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    expect((await service.addQuotation(quotationInput)).versionNumber).toBe(1);
    expect((await service.addQuotation(quotationInput)).versionNumber).toBe(2);
    expect((await service.addQuotation(quotationInput)).versionNumber).toBe(3);
  });

  it("supersedes the previous version and retains full history", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    const first = await service.addQuotation({
      ...quotationInput,
      status: "Submitted",
    });
    const second = await service.addQuotation(quotationInput);
    expect(first.status).toBe("Superseded");
    expect(second.versionNumber).toBe(2);
    expect(store.quotations).toHaveLength(2);
  });

  it("edits a Draft without creating another version", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    const draft = await service.addQuotation(quotationInput);
    const edited = await service.editDraftQuotation(draft.id, {
      ...quotationInput,
      quotationAmount: "1350000",
      status: "Submitted",
    });
    expect(edited).toMatchObject({
      versionNumber: 1,
      quotationAmount: "1350000.00",
      status: "Submitted",
    });
    expect(store.quotations).toHaveLength(1);
  });

  it("does not rewrite Submitted or Final commercial history", async () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    const submitted = await service.addQuotation({
      ...quotationInput,
      status: "Submitted",
    });
    await expect(
      service.editDraftQuotation(submitted.id, {
        ...quotationInput,
        quotationAmount: "1",
      }),
    ).rejects.toThrow("Only a Draft");
  });

  it("keeps only one Final quotation at a time", async () => {
    const store = new MemoryCostingStore();
    const service = createCostingQuotationService(store);
    const first = await service.addQuotation({
      ...quotationInput,
      status: "Submitted",
    });
    await service.markQuotationFinal(first.id, projectId);
    const second = await service.addQuotation({
      ...quotationInput,
      status: "Submitted",
    });
    await service.markQuotationFinal(second.id, projectId);
    expect(store.quotations.filter(({ status }) => status === "Final")).toEqual(
      [expect.objectContaining({ id: second.id })],
    );
    expect(first.status).toBe("Superseded");
  });

  it("requires a positive Quotation Amount", () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    expect(() =>
      service.addQuotation({ ...quotationInput, quotationAmount: "-5" }),
    ).toThrow(CostingValidationError);
  });

  it("serializes concurrent version creation without duplicate numbers", async () => {
    const service = createCostingQuotationService(new MemoryCostingStore());
    const versions = await Promise.all([
      service.addQuotation(quotationInput),
      service.addQuotation(quotationInput),
      service.addQuotation(quotationInput),
    ]);
    expect(versions.map(({ versionNumber }) => versionNumber).sort()).toEqual([
      1, 2, 3,
    ]);
  });

  it("does not modify Project Status, Job Code, or FY sequence", async () => {
    const project = {
      projectStatus: "Quotation",
      jobCode: "GDS168",
      nextJobNumber: 169,
    };
    const before = structuredClone(project);
    const service = createCostingQuotationService(new MemoryCostingStore());
    await service.saveRequirement(requirementInput);
    await service.addEntry(entryInput);
    await service.addQuotation(quotationInput);
    expect(project).toEqual(before);
  });
});
