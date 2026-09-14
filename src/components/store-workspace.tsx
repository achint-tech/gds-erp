"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatTaskDate } from "@/lib/task-timing";
import {
  inventoryCategories,
  materialIssueRecipients,
  materialRequestStatuses,
  storageLocations,
  type InventoryItem,
  type MaterialRequest,
  type StockIssue,
  type StockReceipt,
} from "@/lib/store-data";
import {
  getAvailableStock,
  getMaterialRequestHealth,
  getRemainingAllocation,
  getRequestShortage,
  getShortageQty,
  getStoreSummary,
  getTotalAllocated,
  isLowStock,
  validateAllocation,
  validateIssue,
} from "@/lib/store-utils";

export function StoreWorkspace({
  initialItems,
  initialRequests,
  initialReceipts,
  initialIssues,
}: {
  initialItems: InventoryItem[];
  initialRequests: MaterialRequest[];
  initialReceipts: StockReceipt[];
  initialIssues: StockIssue[];
}) {
  const [items, setItems] = useState(initialItems);
  const [requests, setRequests] = useState(initialRequests);
  const [receipts, setReceipts] = useState(initialReceipts);
  const [issues, setIssues] = useState(initialIssues);
  const [selectedId, setSelectedId] = useState(initialRequests[0]?.id);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const summary = getStoreSummary(items, requests);
  const selected = requests.find((request) => request.id === selectedId);
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!search ||
            item.itemName.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase())) &&
          (!category || item.category === category) &&
          (!location || item.storageLocation === location) &&
          (!lowOnly || isLowStock(item)),
      ),
    [items, search, category, location, lowOnly],
  );

  function updateRequest(request: MaterialRequest) {
    setRequests(
      requests.map((item) => (item.id === request.id ? request : item)),
    );
  }
  function addAllocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const item = items.find(
      (value) => value.id === data.get("inventoryItemId"),
    );
    if (!item) return;
    const allocation = {
      inventoryItemId: item.id,
      requestedQty: Number(data.get("requestedQty")),
      availableQty: getAvailableStock(item, requests),
      allocatedQty: Number(data.get("allocatedQty")),
      issuedQty: 0,
    };
    const validation = validateAllocation(allocation, item);
    if (!validation.valid) return setMessage(validation.message);
    updateRequest({
      ...selected,
      allocations: [
        ...selected.allocations.filter(
          (value) => value.inventoryItemId !== item.id,
        ),
        allocation,
      ],
    });
    setMessage("Allocation saved locally.");
    event.currentTarget.reset();
  }
  function addReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const quantity = Math.round(Number(data.get("quantityReceived")));
    const itemId = String(data.get("inventoryItemId"));
    if (quantity <= 0)
      return setMessage("Receipt quantity must be greater than zero.");
    const storageLocation = String(
      data.get("storageLocation"),
    ) as StockReceipt["storageLocation"];
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantityOnHand: item.quantityOnHand + quantity,
              storageLocation,
            }
          : item,
      ),
    );
    setReceipts([
      ...receipts,
      {
        id: `REC-${Date.now()}`,
        jobCode: String(data.get("jobCode")),
        purchaseRequestId: String(data.get("purchaseRequestId")),
        supplierPoReference: String(data.get("supplierPoReference")),
        receiptDate: String(data.get("receiptDate")),
        receivedBy: String(data.get("receivedBy")),
        inventoryItemId: itemId,
        quantityReceived: quantity,
        storageLocation,
        notes: String(data.get("notes")),
      },
    ]);
    setMessage("Receipt added to local stock.");
    event.currentTarget.reset();
  }
  function addIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const request = requests.find(
      (value) => value.id === data.get("materialRequestId"),
    );
    const itemId = String(data.get("inventoryItemId"));
    const allocation = request?.allocations.find(
      (value) => value.inventoryItemId === itemId,
    );
    const item = items.find((value) => value.id === itemId);
    const quantity = Math.round(Number(data.get("quantityIssued")));
    if (!request || !allocation || !item)
      return setMessage("Select a valid request allocation.");
    const validation = validateIssue(quantity, allocation);
    if (!validation.valid) return setMessage(validation.message);
    if (quantity > item.quantityOnHand)
      return setMessage("Issue quantity cannot exceed stock on hand.");
    setRequests(
      requests.map((value) =>
        value.id === request.id
          ? {
              ...value,
              allocations: value.allocations.map((entry) =>
                entry.inventoryItemId === itemId
                  ? { ...entry, issuedQty: entry.issuedQty + quantity }
                  : entry,
              ),
            }
          : value,
      ),
    );
    setItems(
      items.map((value) =>
        value.id === itemId
          ? { ...value, quantityOnHand: value.quantityOnHand - quantity }
          : value,
      ),
    );
    setIssues([
      ...issues,
      {
        id: `ISS-${Date.now()}`,
        jobCode: request.jobCode,
        materialRequestId: request.id,
        inventoryItemId: itemId,
        issueDate: String(data.get("issueDate")),
        issuedTo: String(data.get("issuedTo")) as StockIssue["issuedTo"],
        quantityIssued: quantity,
        notes: String(data.get("notes")),
      },
    ]);
    setMessage("Material issued from local stock.");
    event.currentTarget.reset();
  }

  return (
    <>
      <div>
        <p className="eyebrow">Department workspace</p>
        <h1 className="page-title">Store / Inventory</h1>
        <p className="subtle mt-2 text-sm">
          Operational stock availability, allocation and issue · Fictional local
          data only
        </p>
      </div>
      <section className="panel mt-6 p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Inventory Items" value={summary.inventoryItemCount} />
          <Metric
            label="Open Material Requests"
            value={summary.openRequestCount}
          />
          <Metric
            label="Requests With Shortage"
            value={summary.shortageRequestCount}
          />
          <Metric label="Ready to Issue" value={summary.readyToIssueCount} />
          <Metric label="Low Stock Items" value={summary.lowStockItemCount} />
        </dl>
      </section>
      {message && (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          {message}
        </p>
      )}
      <section className="panel mt-5 overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="control"
            placeholder="Search inventory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {inventoryCategories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            className="control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {storageLocations.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
            />{" "}
            Low stock only
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Storage Location</th>
                <th>On Hand</th>
                <th>Allocated</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold">
                    {item.itemName}
                    <span className="block text-xs text-slate-500">
                      {item.id}
                      {isLowStock(item) ? " · Low Stock" : ""}
                    </span>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.unit}</td>
                  <td>{item.storageLocation}</td>
                  <td>{item.quantityOnHand}</td>
                  <td>{getTotalAllocated(item.id, requests)}</td>
                  <td>{getAvailableStock(item, requests)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold">Material Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>Project</th>
                <th>Request</th>
                <th>Requested By</th>
                <th>Request Date</th>
                <th>Required Date</th>
                <th>Status</th>
                <th>Availability</th>
                <th>Shortage</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const requested = request.allocations.reduce(
                  (sum, value) => sum + value.requestedQty,
                  0,
                );
                const allocated = request.allocations.reduce(
                  (sum, value) => sum + value.allocatedQty,
                  0,
                );
                return (
                  <tr
                    key={request.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(request.id)}
                  >
                    <td>
                      <Link
                        className="font-bold text-blue-800 hover:underline"
                        href={`/projects/${request.jobCode}`}
                      >
                        {request.jobCode}
                      </Link>
                    </td>
                    <td className="font-semibold">{request.requestTitle}</td>
                    <td>{request.requestedBy}</td>
                    <td>{formatTaskDate(request.requestDate)}</td>
                    <td>
                      {formatTaskDate(request.requiredDate)}
                      <span className="block text-xs text-slate-500">
                        {getMaterialRequestHealth(request).label}
                      </span>
                    </td>
                    <td>{request.status}</td>
                    <td>
                      {allocated} / {requested}
                    </td>
                    <td>{getRequestShortage(request)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <section className="panel mt-5 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <p className="eyebrow">Material Request</p>
              <h2 className="mt-1 font-bold">{selected.requestTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selected.jobCode} · {selected.requestedBy}
              </p>
            </div>
            <select
              className="control max-w-xs"
              value={selected.status}
              onChange={(e) =>
                updateRequest({
                  ...selected,
                  status: e.target.value as MaterialRequest["status"],
                })
              }
            >
              {materialRequestStatuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="button button-secondary"
              href={selected.materialListLink}
              target="_blank"
              rel="noreferrer"
            >
              Open Material List ↗
            </a>
            {getRequestShortage(selected) > 0 && (
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  setMessage(
                    "Prototype handoff only: create the Purchase Request in Purchase.",
                  )
                }
              >
                Create Purchase Request
              </button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table min-w-[650px]">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Requested</th>
                  <th>Available at Check</th>
                  <th>Allocated</th>
                  <th>Issued</th>
                  <th>Shortage</th>
                  <th>Remaining Allocation</th>
                </tr>
              </thead>
              <tbody>
                {selected.allocations.map((allocation) => (
                  <tr key={allocation.inventoryItemId}>
                    <td>
                      {
                        items.find(
                          (item) => item.id === allocation.inventoryItemId,
                        )?.itemName
                      }
                    </td>
                    <td>{allocation.requestedQty}</td>
                    <td>{allocation.availableQty}</td>
                    <td>{allocation.allocatedQty}</td>
                    <td>{allocation.issuedQty}</td>
                    <td>{getShortageQty(allocation)}</td>
                    <td>{getRemainingAllocation(allocation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-4"
            onSubmit={addAllocation}
          >
            <select name="inventoryItemId" className="control" required>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName}
                </option>
              ))}
            </select>
            <input
              name="requestedQty"
              className="control"
              type="number"
              min="0"
              step="1"
              placeholder="Requested Qty"
              required
            />
            <input
              name="allocatedQty"
              className="control"
              type="number"
              min="0"
              step="1"
              placeholder="Allocated Qty"
              required
            />
            <button className="button button-secondary" type="submit">
              Save Allocation
            </button>
          </form>
        </section>
      )}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <StoreForm title="Record Receipt" onSubmit={addReceipt}>
          <OptionalProjectFields />
          <ItemSelect items={items} />
          <input className="control" name="receiptDate" type="date" required />
          <input
            className="control"
            name="receivedBy"
            placeholder="Received By"
            required
          />
          <input
            className="control"
            name="quantityReceived"
            type="number"
            min="1"
            step="1"
            placeholder="Quantity Received"
            required
          />
          <select className="control" name="storageLocation">
            {storageLocations.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input
            className="control sm:col-span-2"
            name="notes"
            placeholder="Notes"
          />
          <button className="button button-primary sm:col-span-2" type="submit">
            Record Receipt
          </button>
        </StoreForm>
        <StoreForm title="Issue Material" onSubmit={addIssue}>
          <select className="control" name="materialRequestId" required>
            {requests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.id} · {request.jobCode}
              </option>
            ))}
          </select>
          <ItemSelect items={items} />
          <input className="control" name="issueDate" type="date" required />
          <select className="control" name="issuedTo">
            {materialIssueRecipients.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input
            className="control"
            name="quantityIssued"
            type="number"
            min="1"
            step="1"
            placeholder="Quantity Issued"
            required
          />
          <input className="control" name="notes" placeholder="Notes" />
          <button className="button button-primary sm:col-span-2" type="submit">
            Issue Material
          </button>
        </StoreForm>
      </div>
      <p className="mt-5 text-xs text-slate-500">
        {receipts.length} receipt record(s) · {issues.length} issue record(s) ·
        Local prototype changes are not persisted.
      </p>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-bold">{value}</dd>
    </div>
  );
}
function StoreForm({
  title,
  onSubmit,
  children,
}: {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <form className="panel p-5" onSubmit={onSubmit}>
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </form>
  );
}
function ItemSelect({ items }: { items: InventoryItem[] }) {
  return (
    <select className="control" name="inventoryItemId" required>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.itemName}
        </option>
      ))}
    </select>
  );
}
function OptionalProjectFields() {
  return (
    <>
      <input
        className="control"
        name="jobCode"
        placeholder="Job Code (optional)"
      />
      <input
        className="control"
        name="purchaseRequestId"
        placeholder="Purchase Request ID (optional)"
      />
      <input
        className="control sm:col-span-2"
        name="supplierPoReference"
        placeholder="Supplier PO Reference (optional)"
      />
    </>
  );
}
