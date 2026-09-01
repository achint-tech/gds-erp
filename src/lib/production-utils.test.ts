import { describe, expect, it } from "vitest";
import { productionRecords } from "./production-data";
import {
  deriveQCStatus,
  getProductionHealth,
  getProductionProgress,
} from "./production-utils";

describe("production calculations", () => {
  it("derives pending, packed pending, and completion percentage", () => {
    expect(
      getProductionProgress({
        requiredQty: 30,
        completedQty: 18,
        packedQty: 0,
      }),
    ).toEqual({ pendingQty: 12, completionPercent: 60, packedPendingQty: 30 });
  });
  it("calculates overdue days for unfinished production", () => {
    const result = getProductionHealth(
      productionRecords[3],
      new Date(2026, 8, 1),
    );
    expect(result).toMatchObject({ health: "Overdue", daysDelayed: 3 });
  });
  it("reports due soon and on track", () => {
    expect(
      getProductionHealth(
        { ...productionRecords[0], internalDeadline: "2026-09-03" },
        new Date(2026, 8, 1),
      ).health,
    ).toBe("Due Soon");
    expect(
      getProductionHealth(
        { ...productionRecords[0], internalDeadline: "2026-09-10" },
        new Date(2026, 8, 1),
      ).health,
    ).toBe("On Track");
  });
  it("marks quantity-complete production completed", () => {
    expect(
      getProductionHealth(productionRecords[1], new Date(2026, 8, 1)).health,
    ).toBe("Completed");
  });
  it("derives rework from QC quantity", () => {
    expect(
      deriveQCStatus({
        ...productionRecords[0].qc,
        qcStatus: "Passed",
        reworkQty: 1,
      }),
    ).toBe("Rework Required");
  });
});
