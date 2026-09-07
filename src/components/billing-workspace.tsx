"use client";

import { useState, type FormEvent } from "react";
import { billStatuses, billTypes, type BillRecord } from "@/lib/billing-data";
import { formatBillAmount, getBillingSummary } from "@/lib/billing-utils";
import type { SiteExecution } from "@/lib/site-execution-data";
import { getBillingReadiness } from "@/lib/site-execution-utils";
import { formatTaskDate } from "@/lib/task-timing";

export function BillingWorkspace({
  initialBills,
  siteExecution,
}: {
  initialBills: BillRecord[];
  siteExecution?: SiteExecution;
}) {
  const [bills, setBills] = useState(initialBills);
  const [editingId, setEditingId] = useState<string>();
  const readiness = getBillingReadiness(siteExecution);
  const summary = getBillingSummary(bills);
  const editing = bills.find((bill) => bill.id === editingId);

  function saveBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const bill: BillRecord = {
      id: editing?.id ?? `BILL-${Date.now()}`,
      billType: String(data.get("billType")) as BillRecord["billType"],
      billNo: String(data.get("billNo")),
      billDate: String(data.get("billDate")),
      billAmount: Math.max(0, Math.round(Number(data.get("billAmount")))),
      status: String(data.get("status")) as BillRecord["status"],
    };
    setBills(
      editing
        ? bills.map((item) => (item.id === editing.id ? bill : item))
        : [...bills, bill],
    );
    setEditingId(undefined);
    event.currentTarget.reset();
  }

  return (
    <section className="space-y-5" aria-labelledby="billing-heading">
      <div className="panel p-5">
        <p className="eyebrow">Billing</p>
        <h2
          id="billing-heading"
          className={`mt-1 text-lg font-bold ${readiness.ready ? "text-emerald-800" : "text-amber-800"}`}
        >
          {readiness.status}
        </h2>
        {!readiness.ready && (
          <p className="mt-1 text-sm text-slate-600">{readiness.reason}</p>
        )}
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric
            label="Total Billed"
            value={formatBillAmount(summary.totalBilled)}
          />
          <Metric label="Number of Bills" value={String(summary.billCount)} />
          <Metric
            label="Latest Bill Status"
            value={summary.latestBillStatus ?? "—"}
          />
        </dl>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold">Bills</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>Bill Type</th>
                <th>Bill No.</th>
                <th>Bill Date</th>
                <th>Bill Amount</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.billType}</td>
                  <td className="font-semibold">{bill.billNo}</td>
                  <td>{formatTaskDate(bill.billDate)}</td>
                  <td>{formatBillAmount(bill.billAmount)}</td>
                  <td>{bill.status}</td>
                  <td>
                    <button
                      className="text-sm font-bold text-blue-800 hover:underline"
                      type="button"
                      onClick={() => setEditingId(bill.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500">
                    No bills added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form
        key={editing?.id ?? "new"}
        className="panel p-5"
        onSubmit={saveBill}
      >
        <h3 className="font-bold">{editing ? "Edit Bill" : "Add Bill"}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            name="billType"
            className="field"
            defaultValue={editing?.billType}
            required
          >
            {billTypes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input
            name="billNo"
            className="field"
            placeholder="Bill No."
            defaultValue={editing?.billNo}
            required
          />
          <input
            name="billDate"
            type="date"
            className="field"
            defaultValue={editing?.billDate}
            required
          />
          <input
            name="billAmount"
            type="number"
            min="0"
            step="1"
            className="field"
            placeholder="Bill Amount"
            defaultValue={editing?.billAmount}
            required
          />
          <select
            name="status"
            className="field"
            defaultValue={editing?.status}
            required
          >
            {billStatuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="button button-primary" type="submit">
            {editing ? "Save Changes" : "Add Bill"}
          </button>
          {editing && (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setEditingId(undefined)}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <p className="text-xs text-slate-500">
        Prototype-only local changes are not persisted.
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
