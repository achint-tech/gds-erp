import { describe, expect, it } from "vitest";
import { workOrders, type WorkOrder } from "./work-order-data";
import {
  getWorkOrderHealth,
  getWorkOrderSummary,
  validatePayableReady,
} from "./work-order-utils";

describe("Vendor Work Order derivations", () => {
  it("derives counts and commercial totals", () => {
    expect(getWorkOrderSummary(workOrders)).toMatchObject({
      totalCount: 2,
      activeCount: 1,
      payableReadyCount: 0,
      totalAgreedValue: 275000,
      totalPayableValue: 180000,
    });
  });

  it("counts completed and payable-ready records", () => {
    const payable = { ...workOrders[1], status: "Payable Ready" as const };
    expect(getWorkOrderSummary([workOrders[0], payable])).toMatchObject({
      activeCount: 0,
      completedOrPayableReadyCount: 1,
      payableReadyCount: 1,
    });
  });

  it("derives deadline health without marking completed states overdue", () => {
    expect(
      getWorkOrderHealth(
        { ...workOrders[1], status: "In Progress" },
        new Date("2026-09-14T00:00:00"),
      ).health,
    ).toBe("Overdue");
    expect(
      getWorkOrderHealth(workOrders[0], new Date("2026-09-14T00:00:00")).health,
    ).toBe("Completed");
  });

  it("requires payable value and external measurement for measurement-based readiness", () => {
    const order = {
      ...workOrders[1],
      status: "Payable Ready",
    } as WorkOrder;
    expect(validatePayableReady(order).valid).toBe(false);
    expect(
      validatePayableReady({
        ...order,
        payableAmount: 92000,
        measurementDriveLink: "https://drive.google.com/",
      }).valid,
    ).toBe(true);
  });
});
