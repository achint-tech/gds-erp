"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { savePrintRequestAction } from "@/app/projects/print-request-actions";
import { StatusBadge } from "@/components/status-badge";
import {
  formatPrintSize,
  printRequestStatuses,
  printSizeUnits,
  printTypes,
  type PrintRequest,
  type PrintRequestWorkspaceData,
} from "@/server/print-requests/print-request-domain";
export function PersistentPrintRequests({
  projectId,
  workspace,
  loadError,
}: {
  projectId: string;
  workspace: PrintRequestWorkspaceData | null;
  loadError: boolean;
}) {
  const router = useRouter(),
    [pending, start] = useTransition(),
    [editing, setEditing] = useState<PrintRequest | "new" | null>(null),
    [message, setMessage] = useState(""),
    [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}),
    [isError, setIsError] = useState(false);
  if (loadError || !workspace)
    return (
      <section className="panel mt-5 p-5">
        <p className="eyebrow">Print / Branding</p>
        <h2 className="mt-1 font-bold">Print workspace unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          The Print Request migration may not have been applied yet.
        </p>
      </section>
    );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    start(async () => {
      const result = await savePrintRequestAction(
        editing === "new" ? null : editing!.id,
        {
          projectId,
          printType: String(f.get("printType")),
          description: String(f.get("description")),
          width: String(f.get("width")),
          height: String(f.get("height")),
          sizeUnit: String(f.get("sizeUnit")),
          quantity: Number(f.get("quantity")),
          location: String(f.get("location")),
          artworkLink: String(f.get("artworkLink")),
          requestedByUserId: String(f.get("requestedByUserId")),
          requiredByDate: String(f.get("requiredByDate")),
          vendorName: String(f.get("vendorName")),
          status: String(f.get("status")),
          notes: String(f.get("notes")),
        },
      );
      setMessage(
        result.success
          ? "Print Request saved."
          : result.error || "Save failed.",
      );
      setFieldErrors(result.fieldErrors ?? {});
      setIsError(!result.success);
      if (result.success) {
        setEditing(null);
        router.refresh();
      }
    });
  }
  return (
    <section className="mt-5 space-y-4" aria-labelledby="print-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Print / Branding</p>
          <h2 id="print-heading" className="mt-1 text-xl font-bold">
            Operational Print Requests
          </h2>
          <p className="subtle mt-1 text-sm">
            Commercial Purchase activity is handled separately.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setEditing("new");
            setFieldErrors({});
            setMessage("");
          }}
        >
          + Raise Print Request
        </button>
      </div>
      <div className="panel grid grid-cols-2 sm:grid-cols-4">
        <Metric label="Open Requests" value={workspace.summary.openRequests} />
        <Metric label="In Production" value={workspace.summary.inProduction} />
        <Metric label="Ready" value={workspace.summary.ready} />
        <Metric label="Installed" value={workspace.summary.installed} />
      </div>
      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      {editing && (
        <RequestForm
          request={editing === "new" ? null : editing}
          requesters={workspace.requesters}
          pending={pending}
          errors={fieldErrors}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {[
                "Type",
                "Description",
                "Size",
                "Qty",
                "Location",
                "Requested By",
                "Required By",
                "Vendor",
                "Status",
                "Artwork",
                "Actions",
              ].map((h) => (
                <th className="border-b px-3 py-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspace.requests.map((r) => (
              <tr className="border-b align-top" key={r.id}>
                <td className="px-3 py-4">{r.printType}</td>
                <td className="px-3 py-4 font-semibold">{r.description}</td>
                <td className="px-3 py-4">{formatPrintSize(r)}</td>
                <td className="px-3 py-4">{r.quantity}</td>
                <td className="px-3 py-4">{r.location}</td>
                <td className="px-3 py-4">{r.requestedBy}</td>
                <td className="px-3 py-4">{r.requiredByDate || "—"}</td>
                <td className="px-3 py-4">{r.vendorName || "—"}</td>
                <td className="px-3 py-4">
                  <StatusBadge tone={printStatusTone(r.status)}>
                    {r.status}
                  </StatusBadge>
                </td>
                <td className="px-3 py-4">
                  {r.artworkLink ? (
                    <a
                      className="font-bold text-blue-800"
                      href={r.artworkLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Artwork ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-4">
                  {["Raised", "Sent to Vendor", "In Production"].includes(
                    r.status,
                  ) && (
                    <button
                      className="font-bold text-blue-800"
                      type="button"
                      onClick={() => {
                        setEditing(r);
                        setFieldErrors({});
                        setMessage("");
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!workspace.requests.length && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No Print / Branding Requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function RequestForm({
  request,
  requesters,
  pending,
  errors,
  onSubmit,
  onCancel,
}: {
  request: PrintRequest | null;
  requesters: PrintRequestWorkspaceData["requesters"];
  pending: boolean;
  errors: Record<string, string>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form className="panel grid gap-4 p-5 md:grid-cols-3" onSubmit={onSubmit}>
      <Input label="Print Type" error={errors.printType}>
        <Select
          name="printType"
          value={request?.printType}
          options={printTypes}
        />
      </Input>
      <Input label="Description" error={errors.description}>
        <input
          className="control"
          name="description"
          defaultValue={request?.description}
          required
        />
      </Input>
      <Input label="Quantity" error={errors.quantity}>
        <input
          className="control"
          name="quantity"
          type="number"
          min="1"
          defaultValue={request?.quantity ?? 1}
          required
        />
      </Input>
      <Input label="Width" error={errors.width || errors.dimensions}>
        <input
          className="control"
          name="width"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={request?.width ?? ""}
        />
      </Input>
      <Input label="Height" error={errors.height || errors.dimensions}>
        <input
          className="control"
          name="height"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={request?.height ?? ""}
        />
      </Input>
      <Input label="Unit" error={errors.sizeUnit}>
        <Select
          name="sizeUnit"
          value={request?.sizeUnit ?? ""}
          options={printSizeUnits}
          optional
        />
      </Input>
      <Input label="Location" error={errors.location}>
        <input
          className="control"
          name="location"
          defaultValue={request?.location}
          required
        />
      </Input>
      <Input label="Requested By" error={errors.requestedByUserId}>
        <Select
          name="requestedByUserId"
          value={request?.requestedByUserId}
          options={requesters.map((r) => [r.id, r.displayName] as const)}
        />
      </Input>
      <Input label="Required By">
        <input
          className="control"
          name="requiredByDate"
          type="date"
          defaultValue={request?.requiredByDate ?? ""}
        />
      </Input>
      <Input label="Vendor">
        <input
          className="control"
          name="vendorName"
          defaultValue={request?.vendorName ?? ""}
        />
      </Input>
      <Input label="Status" error={errors.status}>
        <Select
          name="status"
          value={request?.status ?? "Raised"}
          options={printRequestStatuses}
        />
      </Input>
      <Input label="Artwork Link">
        <input
          className="control"
          name="artworkLink"
          type="url"
          defaultValue={request?.artworkLink ?? ""}
        />
      </Input>
      <Input label="Notes">
        <textarea
          className="control"
          name="notes"
          defaultValue={request?.notes ?? ""}
        />
      </Input>
      <div className="flex gap-2 md:col-span-3">
        <button className="button button-primary" disabled={pending}>
          Save
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
function Input({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-bold uppercase text-slate-600">
        {label}
      </span>
      {children}
      {error && <span className="error mt-1 block">{error}</span>}
    </label>
  );
}
function Select({
  name,
  value,
  options,
  optional = false,
}: {
  name: string;
  value?: string;
  options: readonly (string | readonly [string, string])[];
  optional?: boolean;
}) {
  return (
    <select
      className="control"
      name={name}
      defaultValue={value}
      required={!optional}
    >
      <option value="">Select</option>
      {options.map((o) => {
        const p = typeof o === "string" ? [o, o] : o;
        return (
          <option key={p[0]} value={p[0]}>
            {p[1]}
          </option>
        );
      })}
    </select>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function printStatusTone(status: PrintRequest["status"]) {
  if (status === "Cancelled") return "cancelled" as const;
  if (status === "Installed" || status === "Ready") return "success" as const;
  if (status === "Sent to Vendor") return "waiting" as const;
  if (status === "In Production" || status === "Dispatched")
    return "active" as const;
  return "neutral" as const;
}
