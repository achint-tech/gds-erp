import { describe, expect, it } from "vitest";
import { inventoryItems, materialRequests } from "./store-data";
import {
  getAvailableStock,
  getRemainingAllocation,
  getShortageQty,
  getStoreSummary,
  validateAllocation,
  validateIssue,
} from "./store-utils";

const allocation = materialRequests[1].allocations[0];
describe("Store / Inventory derivations", () => {
  it("calculates availability after remaining allocations", () => {
    expect(getAvailableStock(inventoryItems[2], materialRequests)).toBe(0);
  });
  it("calculates shortage and remaining allocation without negatives", () => {
    expect(getShortageQty(allocation)).toBe(12);
    expect(getRemainingAllocation(allocation)).toBe(18);
    expect(getShortageQty({ ...allocation, allocatedQty: 40 })).toBe(0);
    expect(getRemainingAllocation({ ...allocation, issuedQty: 40 })).toBe(0);
  });
  it("rejects allocation beyond stock and negative values", () => {
    expect(
      validateAllocation({ ...allocation, allocatedQty: 19 }, inventoryItems[2])
        .valid,
    ).toBe(false);
    expect(
      validateAllocation({ ...allocation, requestedQty: -1 }, inventoryItems[2])
        .valid,
    ).toBe(false);
  });
  it("rejects issue beyond remaining allocation", () => {
    expect(validateIssue(19, allocation).valid).toBe(false);
    expect(validateIssue(18, allocation).valid).toBe(true);
  });
  it("derives request and low-stock dashboard counts", () => {
    expect(getStoreSummary(inventoryItems, materialRequests)).toMatchObject({
      openRequestCount: 1,
      shortageRequestCount: 1,
      readyToIssueCount: 1,
      lowStockItemCount: 2,
    });
  });
});
