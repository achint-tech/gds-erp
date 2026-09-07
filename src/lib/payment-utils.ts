import type { BillRecord } from "./billing-data";
import { getBillingSummary } from "./billing-utils";
import type { ProjectPayment } from "./payment-data";
import type { SiteExecution } from "./site-execution-data";
import {
  getBillingReadiness,
  isHandoverComplete,
} from "./site-execution-utils";

export type PaymentStatus = "Pending" | "Partially Received" | "Received";

export function getPaymentSummary(
  bills: BillRecord[],
  payment: ProjectPayment,
) {
  const { totalBilled } = getBillingSummary(bills);
  const totalReceived = Math.max(0, Math.round(payment.amountReceived));
  const pendingAmount = Math.max(totalBilled - totalReceived, 0);
  const paymentStatus: PaymentStatus =
    totalBilled <= 0 || totalReceived <= 0
      ? "Pending"
      : totalReceived < totalBilled
        ? "Partially Received"
        : "Received";
  return { totalBilled, totalReceived, pendingAmount, paymentStatus };
}

export function getClosureReadiness(
  site: SiteExecution | undefined,
  bills: BillRecord[],
  payment: ProjectPayment,
) {
  const summary = getPaymentSummary(bills, payment);
  const ready =
    Boolean(site && isHandoverComplete(site)) &&
    getBillingReadiness(site).ready &&
    summary.totalBilled > 0 &&
    summary.paymentStatus === "Received";
  return ready ? "Ready to Close" : "Not Ready to Close";
}
