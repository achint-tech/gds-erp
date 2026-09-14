"use client";

import { useState, type FormEvent } from "react";
import { formatBillAmount } from "@/lib/billing-utils";
import { formatTaskDate } from "@/lib/task-timing";
import {
  commercialBases,
  workOrderCategories,
  workOrderStatuses,
  type WorkOrder,
} from "@/lib/work-order-data";
import {
  getWorkOrderHealth,
  getWorkOrderSummary,
  validatePayableReady,
} from "@/lib/work-order-utils";

export function WorkOrderWorkspace({
  jobCode,
  initialOrders,
}: {
  jobCode: string;
  initialOrders: WorkOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState(initialOrders[0]?.id);
  const [editingId, setEditingId] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const summary = getWorkOrderSummary(orders);
  const selected = orders.find((order) => order.id === selectedId);
  const editing = orders.find((order) => order.id === editingId);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const order: WorkOrder = {
      id: editing?.id ?? `WO-${Date.now()}`,
      jobCode,
      workCategory: String(
        data.get("workCategory"),
      ) as WorkOrder["workCategory"],
      vendorName: String(data.get("vendorName")),
      scopeSummary: String(data.get("scopeSummary")),
      workOrderNo: String(data.get("workOrderNo")),
      workOrderDate: String(data.get("workOrderDate")),
      commercialBasis: String(
        data.get("commercialBasis"),
      ) as WorkOrder["commercialBasis"],
      agreedAmount: Math.max(0, Math.round(Number(data.get("agreedAmount")))),
      startDate: String(data.get("startDate")),
      targetCompletionDate: String(data.get("targetCompletionDate")),
      actualCompletionDate: String(data.get("actualCompletionDate")),
      status: String(data.get("status")) as WorkOrder["status"],
      workOrderDriveLink: String(data.get("workOrderDriveLink")),
      measurementDriveLink: String(data.get("measurementDriveLink")),
      payableAmount: Math.max(0, Math.round(Number(data.get("payableAmount")))),
      notes: String(data.get("notes")),
    };
    const validation = validatePayableReady(order);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setOrders(
      editing
        ? orders.map((item) => (item.id === editing.id ? order : item))
        : [...orders, order],
    );
    setSelectedId(order.id);
    setEditingId(undefined);
    setShowForm(false);
    setError("");
  }

  function startEdit(order: WorkOrder) {
    setEditingId(order.id);
    setShowForm(true);
    setError("");
  }

  return (
    <section className="space-y-5" aria-labelledby="work-orders-heading">
      <div className="panel p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="eyebrow">Outsourced Execution</p>
            <h2 id="work-orders-heading" className="mt-1 text-lg font-bold">
              Vendor / Work Orders
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Site progress remains in Site Execution.
            </p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setEditingId(undefined);
              setShowForm(true);
              setError("");
            }}
          >
            Add Work Order
          </button>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric
            label="Total Work Orders"
            value={String(summary.totalCount)}
          />
          <Metric
            label="Active Work Orders"
            value={String(summary.activeCount)}
          />
          <Metric
            label="Completed / Payable Ready"
            value={String(summary.completedOrPayableReadyCount)}
          />
          <Metric
            label="Total Agreed Value"
            value={formatBillAmount(summary.totalAgreedValue)}
          />
          <Metric
            label="Total Payable Value"
            value={formatBillAmount(summary.totalPayableValue)}
          />
        </dl>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[980px]">
            <thead>
              <tr>
                <th>Work Category</th>
                <th>Vendor</th>
                <th>Work Order No.</th>
                <th>Commercial Basis</th>
                <th>Agreed Amount</th>
                <th>Status</th>
                <th>Target Completion</th>
                <th>Payable Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.workCategory}</td>
                  <td className="font-semibold">{order.vendorName}</td>
                  <td>{order.workOrderNo}</td>
                  <td>{order.commercialBasis}</td>
                  <td>{formatBillAmount(order.agreedAmount)}</td>
                  <td>{order.status}</td>
                  <td>
                    <span>{formatTaskDate(order.targetCompletionDate)}</span>
                    <span className="block text-xs text-slate-500">
                      {getWorkOrderHealth(order).label}
                    </span>
                  </td>
                  <td>{formatBillAmount(order.payableAmount)}</td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="font-bold text-blue-800"
                        onClick={() => setSelectedId(order.id)}
                      >
                        View
                      </button>
                      {!["Completed", "Payable Ready", "Closed"].includes(
                        order.status,
                      ) && (
                        <button
                          type="button"
                          className="font-bold text-blue-800"
                          onClick={() => startEdit(order)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <section className="panel p-5">
          <p className="eyebrow">Work Order Detail</p>
          <h3 className="mt-1 font-bold">
            {selected.workCategory} · {selected.vendorName}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{selected.scopeSummary}</p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Start Date"
              value={formatTaskDate(selected.startDate)}
            />
            <Metric
              label="Actual Completion"
              value={formatTaskDate(selected.actualCompletionDate)}
            />
            <Metric
              label="Agreed Amount"
              value={formatBillAmount(selected.agreedAmount)}
            />
            <Metric
              label="Payable Amount"
              value={formatBillAmount(selected.payableAmount)}
            />
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            {selected.workOrderDriveLink && (
              <a
                className="button button-secondary"
                href={selected.workOrderDriveLink}
                target="_blank"
                rel="noreferrer"
              >
                Open Work Order / Scope ↗
              </a>
            )}
            {selected.measurementDriveLink && (
              <a
                className="button button-secondary"
                href={selected.measurementDriveLink}
                target="_blank"
                rel="noreferrer"
              >
                Open Measurement ↗
              </a>
            )}
          </div>
          {selected.notes && (
            <p className="mt-4 text-sm text-slate-600">{selected.notes}</p>
          )}
        </section>
      )}

      {showForm && (
        <form key={editing?.id ?? "new"} className="panel p-5" onSubmit={save}>
          <div className="flex justify-between gap-3">
            <h3 className="font-bold">
              {editing ? "Edit Work Order" : "Add Work Order"}
            </h3>
            <button
              type="button"
              className="text-sm font-bold text-slate-600"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm font-bold text-red-700">{error}</p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              name="workCategory"
              label="Work Category"
              options={workOrderCategories}
              value={editing?.workCategory}
            />
            <Input
              name="vendorName"
              label="Vendor Name"
              value={editing?.vendorName}
              required
            />
            <Input
              name="workOrderNo"
              label="Work Order No."
              value={editing?.workOrderNo}
              required
            />
            <Input
              name="workOrderDate"
              label="Work Order Date"
              type="date"
              value={editing?.workOrderDate}
            />
            <Select
              name="commercialBasis"
              label="Commercial Basis"
              options={commercialBases}
              value={editing?.commercialBasis}
            />
            <Input
              name="agreedAmount"
              label="Agreed Amount"
              type="number"
              value={editing?.agreedAmount}
            />
            <Input
              name="startDate"
              label="Start Date"
              type="date"
              value={editing?.startDate}
            />
            <Input
              name="targetCompletionDate"
              label="Target Completion"
              type="date"
              value={editing?.targetCompletionDate}
              required
            />
            <Input
              name="actualCompletionDate"
              label="Actual Completion"
              type="date"
              value={editing?.actualCompletionDate}
            />
            <Select
              name="status"
              label="Status"
              options={workOrderStatuses}
              value={editing?.status}
            />
            <Input
              name="workOrderDriveLink"
              label="Work Order / Scope Drive Link"
              type="url"
              value={editing?.workOrderDriveLink}
            />
            <Input
              name="measurementDriveLink"
              label="Measurement Drive Link"
              type="url"
              value={editing?.measurementDriveLink}
            />
            <Input
              name="payableAmount"
              label="Payable Amount"
              type="number"
              value={editing?.payableAmount}
            />
            <label className="text-xs font-bold uppercase text-slate-500 sm:col-span-2">
              Scope Summary
              <textarea
                name="scopeSummary"
                className="field mt-1"
                defaultValue={editing?.scopeSummary}
                required
              />
            </label>
            <label className="text-xs font-bold uppercase text-slate-500">
              Notes
              <textarea
                name="notes"
                className="field mt-1"
                defaultValue={editing?.notes}
              />
            </label>
          </div>
          <button className="button button-primary mt-4" type="submit">
            {editing ? "Save Changes" : "Add Work Order"}
          </button>
        </form>
      )}
      <p className="text-xs text-slate-500">
        Prototype-only local changes are not persisted. Vendor payment
        processing is not included.
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
function Input({
  name,
  label,
  type = "text",
  value,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string | number;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold uppercase text-slate-500">
      {label}
      <input
        className="field mt-1"
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? 1 : undefined}
        defaultValue={value}
        required={required}
      />
    </label>
  );
}
function Select({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value?: string;
}) {
  return (
    <label className="text-xs font-bold uppercase text-slate-500">
      {label}
      <select className="field mt-1" name={name} defaultValue={value}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
