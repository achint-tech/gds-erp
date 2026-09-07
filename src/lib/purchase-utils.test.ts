import { describe, expect, it } from "vitest";
import { purchaseRequests } from "./purchase-data";
import { canEditPurchaseRequest, getPurchaseHealth } from "./purchase-utils";

const today = new Date(2026, 7, 27);
describe("purchase timing and history rules", () => {
  it("keeps V1 material details in linked sheets", () => {
    expect(
      purchaseRequests.every((request) =>
        request.materialListLink.startsWith("https://"),
      ),
    ).toBe(true);
  });
  it("reports delivery overdue after a supplier PO", () => {
    expect(
      getPurchaseHealth(
        { ...purchaseRequests[0], status: "Awaiting Delivery" },
        today,
      ).health,
    ).toBe("Delivery Overdue");
  });
  it("reports approaching requirements", () => {
    expect(
      getPurchaseHealth(
        {
          ...purchaseRequests[3],
          status: "Sourcing",
          requiredByDate: "2026-08-29",
        },
        today,
      ).health,
    ).toBe("Required Soon");
  });
  it("protects requests after PO issue", () => {
    expect(canEditPurchaseRequest(purchaseRequests[0])).toBe(false);
    expect(canEditPurchaseRequest(purchaseRequests[3])).toBe(false);
  });
});
