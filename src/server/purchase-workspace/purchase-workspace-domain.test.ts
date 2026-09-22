import { describe, expect, it } from "vitest";
import {
  createPurchaseWorkspaceService,
  getGoogleSheetEmbedUrl,
  isGoogleSheetUrl,
  purchaseWorkspaceStatuses,
  type PurchaseWorkspace,
  type PurchaseWorkspaceStore,
  type SavePurchaseWorkspaceInput,
} from "./purchase-workspace-domain";
const projectId = "project-1",
  ownerId = "user-1";
class Store implements PurchaseWorkspaceStore {
  rows = new Map<string, PurchaseWorkspace>();
  project = { status: "PO Received", jobCode: "GDS999", nextJobNumber: 1000 };
  listActiveOwners() {
    return Promise.resolve([{ id: ownerId, displayName: "Fictional User" }]);
  }
  isActiveOwner(id: string) {
    return Promise.resolve(id === ownerId);
  }
  get(id: string) {
    return Promise.resolve(this.rows.get(id) ?? null);
  }
  upsert(input: Required<SavePurchaseWorkspaceInput>) {
    const old = this.rows.get(input.projectId),
      now = new Date();
    const row: PurchaseWorkspace = {
      ...input,
      id: old?.id ?? "workspace-1",
      purchaseOwner: input.purchaseOwnerUserId ? "Fictional User" : null,
      createdAt: old?.createdAt ?? now,
      updatedAt: now,
    };
    this.rows.set(input.projectId, row);
    return Promise.resolve(row);
  }
}
describe("Bought-Out Purchase workspace", () => {
  it("creates one workspace per project and updates the same row", async () => {
    const store = new Store(),
      service = createPurchaseWorkspaceService(store);
    const first = await service.save({ projectId });
    const next = await service.save({ projectId, status: "Ordering" });
    expect(store.rows.size).toBe(1);
    expect(next.id).toBe(first.id);
    expect(next.status).toBe("Ordering");
  });
  it("allows empty owner and Sheet link with default status", async () => {
    const service = createPurchaseWorkspaceService(new Store());
    await expect(service.save({ projectId })).resolves.toMatchObject({
      purchaseOwnerUserId: null,
      purchaseSheetLink: null,
      status: "Not Started",
    });
  });
  it("accepts an active owner and rejects an inactive owner", async () => {
    const service = createPurchaseWorkspaceService(new Store());
    await expect(
      service.save({ projectId, purchaseOwnerUserId: ownerId }),
    ).resolves.toBeTruthy();
    await expect(
      service.save({ projectId, purchaseOwnerUserId: "inactive" }),
    ).rejects.toMatchObject({
      fieldErrors: { purchaseOwnerUserId: expect.any(String) },
    });
  });
  it("contains exactly the approved statuses", () =>
    expect(purchaseWorkspaceStatuses).toEqual([
      "Not Started",
      "In Progress",
      "Ordering",
      "Partially Received",
      "Received",
      "Closed",
    ]));
  it("accepts and preserves a supported Google Sheet URL", async () => {
    const url = "https://docs.google.com/spreadsheets/d/abc_123/edit#gid=0",
      service = createPurchaseWorkspaceService(new Store());
    expect(isGoogleSheetUrl(url)).toBe(true);
    await expect(
      service.save({ projectId, purchaseSheetLink: url }),
    ).resolves.toMatchObject({ purchaseSheetLink: url });
  });
  it("rejects unsupported and non-Google URLs", async () => {
    const service = createPurchaseWorkspaceService(new Store());
    for (const url of [
      "https://example.com/sheet",
      "http://docs.google.com/spreadsheets/d/abc/edit",
      "https://docs.google.com/document/d/abc/edit",
    ])
      await expect(
        service.save({ projectId, purchaseSheetLink: url }),
      ).rejects.toMatchObject({
        fieldErrors: { purchaseSheetLink: expect.any(String) },
      });
  });
  it("builds a safe preview URL and fails gracefully", () => {
    expect(
      getGoogleSheetEmbedUrl(
        "https://docs.google.com/spreadsheets/d/abc_123/edit#gid=0",
      ),
    ).toBe("https://docs.google.com/spreadsheets/d/abc_123/preview");
    expect(getGoogleSheetEmbedUrl("https://example.com/x")).toBeNull();
    expect(getGoogleSheetEmbedUrl(null)).toBeNull();
  });
  it("does not change project identity or persist line items", async () => {
    const store = new Store(),
      service = createPurchaseWorkspaceService(store),
      before = { ...store.project };
    const row = await service.save({ projectId });
    expect(store.project).toEqual(before);
    expect(Object.keys(row)).not.toEqual(
      expect.arrayContaining([
        "items",
        "supplierQuotes",
        "supplierPo",
        "productionMaterials",
      ]),
    );
  });
});
