"use client";

import { useState } from "react";
import type { BillRecord } from "@/lib/billing-data";
import { formatBillAmount } from "@/lib/billing-utils";
import type { ProjectPayment } from "@/lib/payment-data";
import type { SiteExecution } from "@/lib/site-execution-data";
import { getClosureReadiness, getPaymentSummary } from "@/lib/payment-utils";

export function PaymentWorkspace({
  initialPayment,
  bills,
  siteExecution,
}: {
  initialPayment: ProjectPayment;
  bills: BillRecord[];
  siteExecution?: SiteExecution;
}) {
  const [payment, setPayment] = useState(initialPayment);
  const summary = getPaymentSummary(bills, payment);
  const closureReadiness = getClosureReadiness(siteExecution, bills, payment);
  return (
    <section className="space-y-5" aria-labelledby="payment-heading">
      <div className="panel p-5">
        <p className="eyebrow">Payment</p>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <h2 id="payment-heading" className="mt-1 text-lg font-bold">
              {summary.paymentStatus}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {closureReadiness}
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Total Billed"
            value={formatBillAmount(summary.totalBilled)}
          />
          <Metric
            label="Amount Received"
            value={formatBillAmount(summary.totalReceived)}
          />
          <Metric
            label="Pending Amount"
            value={formatBillAmount(summary.pendingAmount)}
          />
          <Metric label="Payment Status" value={summary.paymentStatus} />
        </dl>
      </div>
      <div className="panel p-5">
        <h3 className="font-bold">Update Payment</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase text-slate-500">
            Amount Received
            <input
              className="field mt-1"
              type="number"
              min="0"
              step="1"
              value={payment.amountReceived}
              onChange={(event) =>
                setPayment({
                  ...payment,
                  amountReceived: Math.max(
                    0,
                    Math.round(Number(event.target.value)),
                  ),
                })
              }
            />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">
            Payment Received Date
            <input
              className="field mt-1"
              type="date"
              value={payment.paymentReceivedDate}
              onChange={(event) =>
                setPayment({
                  ...payment,
                  paymentReceivedDate: event.target.value,
                })
              }
            />
          </label>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Payment status and closure readiness are derived. Prototype-only local
        changes are not persisted.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
