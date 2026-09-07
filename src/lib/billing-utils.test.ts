import { describe, expect, it } from "vitest";
import type { BillRecord } from "./billing-data";
import { getBillingSummary } from "./billing-utils";

const bills: BillRecord[] = [
  {
    id: "BILL-1",
    billType: "Final Bill",
    billNo: "PROTO-F",
    billDate: "2026-09-01",
    billAmount: 500000,
    status: "Raised",
  },
  {
    id: "BILL-2",
    billType: "Additional Bill",
    billNo: "PROTO-A",
    billDate: "2026-09-05",
    billAmount: 75000,
    status: "Submitted",
  },
];

describe("Billing summary", () => {
  it("calculates total billed", () => {
    expect(getBillingSummary(bills).totalBilled).toBe(575000);
  });

  it("calculates bill count", () => {
    expect(getBillingSummary(bills).billCount).toBe(2);
  });

  it("summarises multiple bills and the latest status", () => {
    expect(getBillingSummary(bills)).toEqual({
      totalBilled: 575000,
      billCount: 2,
      latestBillStatus: "Submitted",
    });
  });
});
