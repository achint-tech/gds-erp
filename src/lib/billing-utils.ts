import type { BillRecord } from "./billing-data";

export function getBillingSummary(bills: BillRecord[]) {
  return {
    totalBilled: bills.reduce((sum, bill) => sum + bill.billAmount, 0),
    billCount: bills.length,
    latestBillStatus: [...bills].sort((a, b) =>
      b.billDate.localeCompare(a.billDate),
    )[0]?.status,
  };
}

export function formatBillAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
