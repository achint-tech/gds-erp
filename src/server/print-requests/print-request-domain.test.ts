import { describe, expect, it } from "vitest";
import {
  createPrintRequestService,
  formatPrintSize,
  getPrintRequestSummary,
  printTypes,
  type PrintRequest,
  type PrintRequestStore,
  type SavePrintRequestInput,
} from "./print-request-domain";
const projectId = "project-1",
  userId = "user-1";
const base: SavePrintRequestInput = {
  projectId,
  printType: "Fabric",
  description: "Fictional wall graphic",
  width: "2700",
  height: "890",
  sizeUnit: "mm",
  quantity: 1,
  location: "Fictional City",
  artworkLink: null,
  requestedByUserId: userId,
  requiredByDate: null,
  vendorName: null,
  status: "Raised",
  notes: null,
};
class Store implements PrintRequestStore {
  requests: PrintRequest[] = [];
  project = { status: "PO Received", jobCode: "GDS999", nextJobNumber: 1000 };
  listActiveRequesters() {
    return Promise.resolve([{ id: userId, displayName: "Fictional User" }]);
  }
  isActiveRequester(id: string) {
    return Promise.resolve(id === userId);
  }
  list(id: string) {
    return Promise.resolve(this.requests.filter((r) => r.projectId === id));
  }
  create(input: SavePrintRequestInput) {
    const now = new Date(),
      r: PrintRequest = {
        ...input,
        id: `r-${this.requests.length + 1}`,
        requestedBy: "Fictional User",
        createdAt: now,
        updatedAt: now,
      };
    this.requests.push(r);
    return Promise.resolve(r);
  }
  update(id: string, input: SavePrintRequestInput) {
    const index = this.requests.findIndex((r) => r.id === id);
    const r = {
      ...this.requests[index],
      ...input,
      requestedBy: "Fictional User",
      updatedAt: new Date(),
    };
    this.requests[index] = r;
    return Promise.resolve(r);
  }
}
const setup = () => {
  const store = new Store();
  return { store, service: createPrintRequestService(store) };
};
describe("Print Requests", () => {
  it("supports multiple requests and all approved types including Fabric", async () => {
    const { store, service } = setup();
    for (const printType of printTypes)
      await service.add({ ...base, printType });
    expect(store.requests).toHaveLength(printTypes.length);
  });
  it("requires positive quantity", async () => {
    const { service } = setup();
    await expect(service.add({ ...base, quantity: 0 })).rejects.toMatchObject({
      fieldErrors: { quantity: expect.any(String) },
    });
  });
  it("allows dimensions to be omitted", async () => {
    const { service } = setup();
    await expect(
      service.add({ ...base, width: null, height: null, sizeUnit: null }),
    ).resolves.toBeTruthy();
  });
  it("rejects either missing dimension", async () => {
    const { service } = setup();
    await expect(service.add({ ...base, height: null })).rejects.toMatchObject({
      fieldErrors: { dimensions: expect.any(String) },
    });
    await expect(service.add({ ...base, width: null })).rejects.toMatchObject({
      fieldErrors: { dimensions: expect.any(String) },
    });
  });
  it("requires positive dimensions", async () => {
    const { service } = setup();
    await expect(service.add({ ...base, width: "0" })).rejects.toMatchObject({
      fieldErrors: { width: expect.any(String) },
    });
    await expect(service.add({ ...base, height: "-1" })).rejects.toMatchObject({
      fieldErrors: { height: expect.any(String) },
    });
  });
  it("formats structured size", () =>
    expect(formatPrintSize(base)).toBe("2700 × 890 mm"));
  it("requires an active internal requester", async () => {
    const { service } = setup();
    await expect(
      service.add({ ...base, requestedByUserId: "inactive" }),
    ).rejects.toMatchObject({
      fieldErrors: { requestedByUserId: expect.any(String) },
    });
  });
  it("allows empty vendor and artwork link", async () => {
    const { service } = setup();
    const r = await service.add({ ...base, vendorName: "", artworkLink: "" });
    expect(r).toMatchObject({ vendorName: null, artworkLink: null });
  });
  it("retains progressed, Installed, and Cancelled requests", async () => {
    const { store, service } = setup();
    const a = await service.add(base);
    await service.edit(a.id, { ...base, status: "In Production" });
    await service.add({ ...base, status: "Installed" });
    await service.add({ ...base, status: "Cancelled" });
    expect(store.requests.map((r) => r.status)).toEqual([
      "In Production",
      "Installed",
      "Cancelled",
    ]);
  });
  it("derives summary counts", async () => {
    const { store, service } = setup();
    for (const status of [
      "Raised",
      "In Production",
      "Ready",
      "Installed",
      "Cancelled",
    ] as const)
      await service.add({ ...base, status });
    expect(getPrintRequestSummary(store.requests)).toEqual({
      openRequests: 3,
      inProduction: 1,
      ready: 1,
      installed: 1,
    });
  });
  it("contains no financial fields and leaves project identity unchanged", async () => {
    const { store, service } = setup(),
      before = { ...store.project };
    const r = await service.add(base);
    expect(Object.keys(r)).not.toEqual(
      expect.arrayContaining(["cost", "rate", "payment", "supplierPoAmount"]),
    );
    expect(store.project).toEqual(before);
  });
});
