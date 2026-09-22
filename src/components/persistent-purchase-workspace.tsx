"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { savePurchaseWorkspaceAction } from "@/app/projects/purchase-workspace-actions";
import { StatusBadge } from "@/components/status-badge";
import {
  purchaseWorkspaceStatuses,
  type PurchaseWorkspaceData,
} from "@/server/purchase-workspace/purchase-workspace-domain";
export function PersistentPurchaseWorkspace({
  projectId,
  data,
  loadError,
}: {
  projectId: string;
  data: PurchaseWorkspaceData | null;
  loadError: boolean;
}) {
  const router = useRouter(),
    [pending, start] = useTransition(),
    [editing, setEditing] = useState(false),
    [message, setMessage] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [isError, setIsError] = useState(false);
  if (loadError || !data)
    return (
      <section className="panel mt-5 p-5">
        <p className="eyebrow">Purchase</p>
        <h2 className="mt-1 font-bold">Purchase workspace unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          The Bought-Out Purchase migration may not have been applied yet.
        </p>
      </section>
    );
  const workspace = data.workspace;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    start(async () => {
      const result = await savePurchaseWorkspaceAction({
        projectId,
        purchaseOwnerUserId: String(form.get("purchaseOwnerUserId")),
        status: String(form.get("status")),
        purchaseSheetLink: String(form.get("purchaseSheetLink")),
        notes: String(form.get("notes")),
      });
      setErrors(result.fieldErrors ?? {});
      setMessage(
        result.success
          ? "Purchase workspace saved."
          : result.error || "Save failed.",
      );
      setIsError(!result.success);
      if (result.success) {
        setEditing(false);
        router.refresh();
      }
    });
  }
  return (
    <section className="mt-5 space-y-4" aria-labelledby="purchase-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Purchase</p>
          <h2 id="purchase-heading" className="mt-1 text-xl font-bold">
            Bought-Out Purchase
          </h2>
          <p className="subtle mt-1 text-sm">
            Bought-out project items only. Manufacturing material procurement is
            managed under Production.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setEditing(true);
            setErrors({});
            setMessage("");
          }}
        >
          {workspace ? "Edit Workspace" : "Set Up Purchase"}
        </button>
      </div>
      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}
        >
          {message}
        </p>
      )}
      {editing ? (
        <form className="panel grid gap-4 p-5 md:grid-cols-2" onSubmit={submit}>
          <Field label="Purchase Owner" error={errors.purchaseOwnerUserId}>
            <select
              className="control"
              name="purchaseOwnerUserId"
              defaultValue={workspace?.purchaseOwnerUserId ?? ""}
            >
              <option value="">Unassigned</option>
              {data.owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.displayName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Overall Status" error={errors.status}>
            <select
              className="control"
              name="status"
              defaultValue={workspace?.status ?? "Not Started"}
            >
              {purchaseWorkspaceStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Purchase Sheet Link"
            error={errors.purchaseSheetLink}
            wide
          >
            <input
              className="control"
              type="url"
              name="purchaseSheetLink"
              defaultValue={workspace?.purchaseSheetLink ?? ""}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </Field>
          <Field label="Notes" wide>
            <textarea
              className="control min-h-24"
              name="notes"
              defaultValue={workspace?.notes ?? ""}
            />
          </Field>
          <div className="flex gap-2 md:col-span-2">
            <button className="button button-primary" disabled={pending}>
              Save
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        workspace && (
          <div className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Value
              label="Purchase Owner"
              value={workspace.purchaseOwner ?? "Unassigned"}
            />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Overall Status
              </p>
              <div className="mt-2">
                <StatusBadge tone={statusTone(workspace.status)}>
                  {workspace.status}
                </StatusBadge>
              </div>
            </div>
            <Value
              label="Sheet Link"
              value={workspace.purchaseSheetLink ? "Linked" : "Not linked"}
            />
            <Value label="Notes" value={workspace.notes ?? "—"} />
          </div>
        )
      )}
      <section className="panel overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Purchase Working Sheet</p>
            <h3 className="mt-1 font-bold">Google Purchase Sheet</h3>
          </div>
          {workspace?.purchaseSheetLink && (
            <a
              className="button button-secondary"
              href={workspace.purchaseSheetLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit Sheet ↗
            </a>
          )}
        </div>
        {!workspace?.purchaseSheetLink ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Link this project&apos;s Google Purchase Sheet to view the detailed
            bought-out working data here.
          </div>
        ) : data.embedUrl ? (
          <iframe
            className="h-[620px] w-full border-0"
            src={data.embedUrl}
            title="Purchase working sheet"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            This Sheet URL cannot be embedded. Use Edit Sheet to open it in
            Google Sheets.
          </div>
        )}
      </section>
    </section>
  );
}
function Field({
  label,
  error,
  wide = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-bold uppercase text-slate-600">
        {label}
      </span>
      {children}
      {error && <span className="error mt-1 block">{error}</span>}
    </label>
  );
}
function Value({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
function statusTone(status: string) {
  if (status === "Closed" || status === "Received") return "success" as const;
  if (status === "Partially Received") return "waiting" as const;
  if (status === "In Progress" || status === "Ordering")
    return "active" as const;
  return "neutral" as const;
}
