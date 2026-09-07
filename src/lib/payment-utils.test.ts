import { describe, expect, it } from "vitest";
import type { BillRecord } from "./billing-data";
import { siteExecutionByJobCode } from "./site-execution-data";
import { getClosureReadiness, getPaymentSummary } from "./payment-utils";

const bills: BillRecord[] = [
  {
    id: "B-1",
    billType: "Final Bill",
    billNo: "PROTO-1",
    billDate: "2026-09-08",
    billAmount: 100000,
    status: "Approved",
  },
];

describe("Payment derivations", () => {
  it("derives pending payment", () => {
    expect(
      getPaymentSummary(bills, { amountReceived: 0, paymentReceivedDate: "" }),
    ).toEqual({
      totalBilled: 100000,
      totalReceived: 0,
      pendingAmount: 100000,
      paymentStatus: "Pending",
    });
  });

  it("derives partially received payment and pending amount", () => {
    expect(
      getPaymentSummary(bills, {
        amountReceived: 40000,
        paymentReceivedDate: "2026-09-08",
      }),
    ).toEqual({
      totalBilled: 100000,
      totalReceived: 40000,
      pendingAmount: 60000,
      paymentStatus: "Partially Received",
    });
  });

  it("derives fully received payment", () => {
    expect(
      getPaymentSummary(bills, {
        amountReceived: 100000,
        paymentReceivedDate: "2026-09-08",
      }).paymentStatus,
    ).toBe("Received");
  });

  it("never returns a negative pending amount", () => {
    expect(
      getPaymentSummary(bills, {
        amountReceived: 120000,
        paymentReceivedDate: "2026-09-08",
      }).pendingAmount,
    ).toBe(0);
  });

  it("requires completed site, billing readiness, a bill and received payment to close", () => {
    expect(
      getClosureReadiness(siteExecutionByJobCode.GDS149, bills, {
        amountReceived: 100000,
        paymentReceivedDate: "2026-09-08",
      }),
    ).toBe("Ready to Close");
    expect(
      getClosureReadiness(siteExecutionByJobCode.GDS150, bills, {
        amountReceived: 100000,
        paymentReceivedDate: "2026-09-08",
      }),
    ).toBe("Not Ready to Close");
    expect(
      getClosureReadiness(siteExecutionByJobCode.GDS149, bills, {
        amountReceived: 50000,
        paymentReceivedDate: "2026-09-08",
      }),
    ).toBe("Not Ready to Close");
  });
});
