"use client";

import { useState, type FormEvent } from "react";
import { formatTaskDate } from "@/lib/task-timing";
import {
  advanceStatuses,
  purchasePaymentTypes,
  purchasePriorities,
  purchasePurposes,
  purchaseRequiredAtOptions,
  purchaseRequestStatuses,
  receiptConditions,
  supplierQuoteStatuses,
  type PurchaseRequest,
  type SupplierPO,
  type SupplierQuote,
  type UrgentPurchase,
} from "@/lib/purchase-data";
import {
  canEditPurchaseRequest,
  getPurchaseHealth,
} from "@/lib/purchase-utils";

export function PurchaseWorkspace({
  jobCode,
  initialRequests = [],
  initialUrgent = [],
}: {
  jobCode: string;
  initialRequests?: PurchaseRequest[];
  initialUrgent?: UrgentPurchase[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [urgent, setUrgent] = useState(initialUrgent);
  const [selectedId, setSelectedId] = useState(initialRequests[0]?.id ?? "");
  const [form, setForm] = useState<"request" | "urgent" | null>(null);
  const selected = requests.find((request) => request.id === selectedId);
  const delayed = requests.filter((request) =>
    getPurchaseHealth(request).health.includes("Overdue"),
  ).length;
  const count = (status: PurchaseRequest["status"]) =>
    requests.filter((request) => request.status === status).length;

  function updateRequest(id: string, update: Partial<PurchaseRequest>) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, ...update } : request,
      ),
    );
  }
  function addRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = `PR-${Date.now().toString().slice(-4)}`;
    const request: PurchaseRequest = {
      id,
      projectJobCode: jobCode,
      requestTitle: String(data.get("requestTitle")),
      requestedBy: String(data.get("requestedBy")),
      requestDate: browserDate(),
      purpose: data.get("purpose") as PurchaseRequest["purpose"],
      requiredAt: data.get("requiredAt") as PurchaseRequest["requiredAt"],
      deliveryLocation: String(data.get("deliveryLocation")),
      requiredByDate: String(data.get("requiredByDate")),
      priority: data.get("priority") as PurchaseRequest["priority"],
      status: "Request Raised",
      purchaseOwner: "Prototype Purchase Owner",
      materialListLink: String(data.get("materialListLink")),
      supportingLink: String(data.get("supportingLink")),
      notes: String(data.get("notes")),
      relatedPurchaseRequestId: String(data.get("relatedPurchaseRequestId")),
      supplierQuotes: [],
      rateComparisonRequired: data.get("rateComparisonRequired") === "Yes",
      rateComparisonLink: String(data.get("rateComparisonLink")),
    };
    setRequests((current) => [...current, request]);
    setSelectedId(id);
    setForm(null);
  }
  function addUrgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setUrgent((current) => [
      ...current,
      {
        id: `UP-${Date.now()}`,
        projectJobCode: jobCode,
        description: String(data.get("description")),
        amount: String(data.get("amount")),
        vendor: String(data.get("vendor")),
        purchasedBy: String(data.get("purchasedBy")),
        purchaseDate: String(data.get("purchaseDate")),
        reason: String(data.get("reason")),
        screenshotLink: String(data.get("screenshotLink")),
        notes: String(data.get("notes")),
      },
    ]);
    setForm(null);
  }
  return (
    <section className="space-y-5" aria-labelledby="purchase-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Purchase</p>
          <h2 id="purchase-heading" className="mt-1 text-xl font-bold">
            Material &amp; Product Procurement
          </h2>
          <p className="subtle mt-1 text-sm">
            Local prototype only · Execution subcontractors are outside this
            workflow.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="button button-secondary"
            onClick={() => setForm("urgent")}
          >
            + Urgent Purchase
          </button>
          <button
            className="button button-primary"
            onClick={() => setForm("request")}
          >
            + New Purchase Request
          </button>
        </div>
      </div>
      <div className="panel grid grid-cols-3 overflow-hidden md:grid-cols-6 lg:grid-cols-9">
        <Metric label="Total" value={requests.length} />
        <Metric label="New" value={count("Request Raised")} />
        <Metric label="Sourcing" value={count("Sourcing")} />
        <Metric label="Approval" value={count("Awaiting Approval")} />
        <Metric label="PO Issued" value={count("PO Issued")} />
        <Metric label="Awaiting" value={count("Awaiting Delivery")} />
        <Metric label="Delayed" value={delayed} warning />
        <Metric label="Replacement" value={count("Replacement Pending")} />
        <Metric label="Received" value={count("Received")} />
      </div>
      {form === "request" && <NewRequestForm onSubmit={addRequest} />}
      {form === "urgent" && (
        <UrgentForm onSubmit={addUrgent} jobCode={jobCode} />
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {[
                "PR",
                "Request",
                "Purpose",
                "Requested By",
                "Required By",
                "Priority",
                "Status",
                "Health",
                "Action",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const health = getPurchaseHealth(request);
              return (
                <tr key={request.id} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-bold">{request.id}</td>
                  <td className="px-4 py-4">{request.requestTitle}</td>
                  <td className="px-4 py-4">{request.purpose}</td>
                  <td className="px-4 py-4">{request.requestedBy}</td>
                  <td className="px-4 py-4">
                    {formatTaskDate(request.requiredByDate)}
                  </td>
                  <td className="px-4 py-4">{request.priority}</td>
                  <td className="px-4 py-4">
                    <Badge>{request.status}</Badge>
                  </td>
                  <td
                    className={`px-4 py-4 font-semibold ${health.health.includes("Overdue") ? "text-red-700" : ""}`}
                  >
                    {health.label}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      className="font-bold text-blue-800 hover:underline"
                      onClick={() => setSelectedId(request.id)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && (
        <RequestDetail
          request={selected}
          onUpdate={(update) => updateRequest(selected.id, update)}
        />
      )}
      <section className="panel p-5">
        <h3 className="font-bold">Urgent Purchase History</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {urgent.map((purchase) => (
            <article
              key={purchase.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-xs font-bold uppercase text-amber-900">
                Urgent Purchase
              </p>
              <h4 className="mt-1 font-bold">{purchase.description}</h4>
              <p className="mt-2 text-sm">
                {purchase.amount} · {purchase.vendor} ·{" "}
                {formatTaskDate(purchase.purchaseDate)}
              </p>
              {purchase.screenshotLink && (
                <a
                  className="mt-2 inline-block text-sm font-bold text-blue-800 hover:underline"
                  href={purchase.screenshotLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Screenshot ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function RequestDetail({
  request,
  onUpdate,
}: {
  request: PurchaseRequest;
  onUpdate: (update: Partial<PurchaseRequest>) => void;
}) {
  const [showQuote, setShowQuote] = useState(false);
  const [showPO, setShowPO] = useState(false);
  const statusOptions =
    request.status === "Replacement Pending"
      ? (["Replacement Pending", "Received", "Closed"] as const)
      : purchaseRequestStatuses;
  const statusEditable =
    canEditPurchaseRequest(request) || request.status === "Replacement Pending";
  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const quote: SupplierQuote = {
      id: `SQ-${Date.now()}`,
      purchaseRequestId: request.id,
      supplierName: String(data.get("supplierName")),
      amount: String(data.get("amount")),
      quotationLink: String(data.get("quotationLink")),
      status: data.get("status") as SupplierQuote["status"],
      notes: String(data.get("notes")),
      addedDate: browserDate(),
    };
    onUpdate({ supplierQuotes: [...request.supplierQuotes, quote] });
    setShowQuote(false);
  }
  function addPO(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const supplierPO: SupplierPO = {
      poNumber: String(data.get("poNumber")),
      supplierName: String(data.get("supplierName")),
      poDate: String(data.get("poDate")),
      poAmount: String(data.get("poAmount")),
      poLink: String(data.get("poLink")),
      paymentType: data.get("paymentType") as SupplierPO["paymentType"],
      advanceAmount: String(data.get("advanceAmount")),
      creditDays: String(data.get("creditDays")),
      paymentNotes: String(data.get("paymentNotes")),
      expectedDeliveryDate: String(data.get("expectedDeliveryDate")),
      status: "PO Issued",
      advanceStatus: data.get("advanceStatus") as SupplierPO["advanceStatus"],
      actualReceivedDate: "",
      receivedBy: "",
      receiptCondition: "",
      issueNotes: "",
      replacementExpectedDate: "",
    };
    onUpdate({ supplierPO, status: "PO Issued" });
    setShowPO(false);
  }
  return (
    <section className="panel space-y-5 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div>
          <p className="eyebrow">{request.id}</p>
          <h3 className="mt-1 text-lg font-bold">{request.requestTitle}</h3>
          {request.relatedPurchaseRequestId && (
            <p className="mt-1 text-xs text-slate-500">
              Related to {request.relatedPurchaseRequestId}
            </p>
          )}
        </div>
        <label className="field min-w-52">
          <span>Purchase Request Status</span>
          <select
            className="control"
            value={request.status}
            disabled={!statusEditable}
            onChange={(event) =>
              onUpdate({
                status: event.target.value as PurchaseRequest["status"],
              })
            }
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-4">
        <Fact label="Purpose" value={request.purpose} />
        <Fact label="Requested By" value={request.requestedBy} />
        <Fact
          label="Request Date"
          value={formatTaskDate(request.requestDate)}
        />
        <Fact
          label="Required By"
          value={formatTaskDate(request.requiredByDate)}
        />
        <Fact label="Required At" value={request.requiredAt} />
        <Fact label="Delivery" value={request.deliveryLocation} />
        <Fact label="Priority" value={request.priority} />
        <Fact label="Owner" value={request.purchaseOwner} />
      </dl>
      <Compact title="Material / Item List">
        {request.materialListLink ? (
          <a
            href={request.materialListLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-blue-800 hover:underline"
          >
            Open Material List ↗
          </a>
        ) : (
          <p className="text-sm text-slate-500">No material-list link added.</p>
        )}
      </Compact>
      <Compact
        title="Supplier Quotations"
        action={
          <button
            className="font-bold text-blue-800"
            onClick={() => setShowQuote((value) => !value)}
          >
            + Add Supplier Quote
          </button>
        }
      >
        <div className="grid gap-2">
          {request.supplierQuotes.map((quote) => (
            <div
              key={quote.id}
              className="flex flex-wrap justify-between gap-2 rounded border p-3 text-sm"
            >
              <span>
                <strong>{quote.supplierName}</strong> · {quote.amount} ·{" "}
                {quote.status}
              </span>
              {quote.quotationLink && (
                <a
                  href={quote.quotationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-800"
                >
                  Open Quote ↗
                </a>
              )}
            </div>
          ))}
        </div>
        {showQuote && (
          <SimpleForm onSubmit={addQuote}>
            <Input name="supplierName" label="Supplier Name" required />
            <Input name="amount" label="Amount" required />
            <Input
              name="quotationLink"
              label="Google Drive / Quotation Link"
              type="url"
            />
            <Select
              name="status"
              label="Status"
              options={supplierQuoteStatuses}
            />
            <Input name="notes" label="Notes" />
            <Submit>Add Quote</Submit>
          </SimpleForm>
        )}
      </Compact>
      <Compact title="Rate Comparison">
        <p className="text-sm">
          Required:{" "}
          <strong>{request.rateComparisonRequired ? "Yes" : "No"}</strong>
        </p>
        {request.rateComparisonRequired && request.rateComparisonLink && (
          <a
            href={request.rateComparisonLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-bold text-blue-800"
          >
            Open Comparison ↗
          </a>
        )}
      </Compact>
      {request.status === "Awaiting Approval" && (
        <Compact title="Management Approval">
          <p className="mb-3 text-sm text-slate-600">
            Final approval belongs to Management. No monetary thresholds are
            defined.
          </p>
          <p className="mb-3 text-sm text-slate-600">
            {request.requestTitle} · {request.projectJobCode}
          </p>
          {request.materialListLink && (
            <a
              href={request.materialListLink}
              target="_blank"
              rel="noreferrer"
              className="mb-3 inline-block text-sm font-bold text-blue-800"
            >
              Open Material List ↗
            </a>
          )}
          <div className="flex gap-2">
            <button
              className="button button-primary"
              onClick={() => onUpdate({ status: "Approved" })}
            >
              Approve
            </button>
            <button
              className="button button-secondary"
              onClick={() => onUpdate({ status: "Sourcing" })}
            >
              Reject / Send Back
            </button>
          </div>
        </Compact>
      )}
      <Compact
        title="Supplier PO"
        action={
          request.status === "Approved" && !request.supplierPO ? (
            <button
              className="font-bold text-blue-800"
              onClick={() => setShowPO((value) => !value)}
            >
              Create Supplier PO
            </button>
          ) : undefined
        }
      >
        {request.supplierPO ? (
          <SupplierPODetail po={request.supplierPO} />
        ) : (
          <p className="text-sm text-slate-500">No Supplier PO issued.</p>
        )}
        {showPO && (
          <SimpleForm onSubmit={addPO}>
            <Input name="poNumber" label="PO Number" required />
            <Input name="supplierName" label="Supplier Name" required />
            <Input name="poDate" label="PO Date" type="date" required />
            <Input name="poAmount" label="PO Amount" required />
            <Input name="poLink" label="PO Link" type="url" />
            <Select
              name="paymentType"
              label="Payment Type"
              options={purchasePaymentTypes}
            />
            <Input
              name="advanceAmount"
              label="Advance Amount (when applicable)"
            />
            <Input name="creditDays" label="Credit Days (when applicable)" />
            <Select
              name="advanceStatus"
              label="Advance Status"
              options={advanceStatuses}
            />
            <Input
              name="expectedDeliveryDate"
              label="Expected Delivery"
              type="date"
              required
            />
            <Input name="paymentNotes" label="Payment Notes" />
            <Submit>Create Supplier PO</Submit>
          </SimpleForm>
        )}
      </Compact>
      <Compact title="Delivery / Receipt">
        <ReceiptForm request={request} onUpdate={onUpdate} />
      </Compact>
    </section>
  );
}

function ReceiptForm({
  request,
  onUpdate,
}: {
  request: PurchaseRequest;
  onUpdate: (update: Partial<PurchaseRequest>) => void;
}) {
  if (!request.supplierPO)
    return (
      <p className="text-sm text-slate-500">
        Available after Supplier PO creation.
      </p>
    );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const condition = data.get(
      "receiptCondition",
    ) as SupplierPO["receiptCondition"];
    const supplierPO = {
      ...request.supplierPO!,
      actualReceivedDate: String(data.get("actualReceivedDate")),
      receivedBy: String(data.get("receivedBy")),
      receiptCondition: condition,
      issueNotes: String(data.get("issueNotes")),
      replacementExpectedDate: String(data.get("replacementExpectedDate")),
    };
    onUpdate({
      supplierPO,
      status: condition === "OK" ? "Received" : "Replacement Pending",
    });
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Input
        name="actualReceivedDate"
        label="Actual Received Date"
        type="date"
        required
      />
      <Input name="receivedBy" label="Received By" required />
      <Select
        name="receiptCondition"
        label="Receipt Condition"
        options={receiptConditions}
      />
      <Input name="issueNotes" label="Issue Notes" />
      <Input
        name="replacementExpectedDate"
        label="Replacement Expected Date"
        type="date"
      />
      <Submit>Record Receipt</Submit>
    </form>
  );
}
function SupplierPODetail({ po }: { po: SupplierPO }) {
  const advanceRequired =
    po.paymentType === "Advance" || po.paymentType === "Part Advance + Balance";
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-3">
      <Fact label="PO" value={po.poNumber} />
      <Fact label="Supplier" value={po.supplierName} />
      <Fact label="Amount" value={po.poAmount} />
      <Fact label="Payment" value={po.paymentType} />
      <Fact
        label="Expected Delivery"
        value={formatTaskDate(po.expectedDeliveryDate)}
      />
      {advanceRequired && (
        <Fact label="Advance Required" value={po.advanceStatus} />
      )}
      {po.poLink && (
        <a
          href={po.poLink}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-blue-800"
        >
          Open Supplier PO ↗
        </a>
      )}
    </div>
  );
}
function NewRequestForm({
  onSubmit,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <SimpleForm onSubmit={onSubmit}>
      <Input name="requestTitle" label="Request Title" required />
      <Input name="requestedBy" label="Requested By" required />
      <Select name="purpose" label="Purpose" options={purchasePurposes} />
      <Select
        name="requiredAt"
        label="Required At"
        options={purchaseRequiredAtOptions}
      />
      <Input name="deliveryLocation" label="Delivery Location" required />
      <Input
        name="requiredByDate"
        label="Required By Date"
        type="date"
        required
      />
      <Select name="priority" label="Priority" options={purchasePriorities} />
      <Input
        name="materialListLink"
        label="Material / Item List Google Sheet or Drive Link"
        type="url"
        required
      />
      <Input
        name="supportingLink"
        label="Supporting Document Link"
        type="url"
      />
      <Input name="relatedPurchaseRequestId" label="Related PR (optional)" />
      <Select
        name="rateComparisonRequired"
        label="Rate Comparison Required?"
        options={["No", "Yes"]}
      />
      <Input
        name="rateComparisonLink"
        label="Rate Comparison Sheet Link"
        type="url"
      />
      <Input name="notes" label="Notes" />
      <Submit>Create Purchase Request</Submit>
    </SimpleForm>
  );
}
function UrgentForm({
  onSubmit,
  jobCode,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  jobCode: string;
}) {
  return (
    <SimpleForm onSubmit={onSubmit}>
      <Fact label="Project" value={jobCode} />
      <Input name="description" label="Item / Description" required />
      <Input name="amount" label="Amount" required />
      <Input name="vendor" label="Vendor / Shop" required />
      <Input name="purchasedBy" label="Purchased By" required />
      <Input name="purchaseDate" label="Purchase Date" type="date" required />
      <Input name="reason" label="Reason" required />
      <Input
        name="screenshotLink"
        label="Payment Screenshot / Drive Link"
        type="url"
      />
      <Input name="notes" label="Notes" />
      <Submit>Add Urgent Purchase</Submit>
    </SimpleForm>
  );
}
function SimpleForm({
  onSubmit,
  children,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 grid gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-4 sm:grid-cols-2"
    >
      {children}
    </form>
  );
}
function Input({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="control" name={name} type={type} required={required} />
    </label>
  );
}
function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="control" name={name}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Submit({ children }: { children: React.ReactNode }) {
  return (
    <div className="self-end">
      <button className="button button-primary" type="submit">
        {children}
      </button>
    </div>
  );
}
function Compact({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex justify-between gap-3">
        <h4 className="font-bold">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value || "—"}</dd>
    </div>
  );
}
function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="border-b border-r p-3">
      <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${warning && value ? "text-red-700" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">
      {children}
    </span>
  );
}
function browserDate() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
