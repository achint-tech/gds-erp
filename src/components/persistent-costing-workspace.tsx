"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  cancelCostingEntryAction,
  markQuotationFinalAction,
  saveCostingEntryAction,
  saveCostingRequirementAction,
  saveQuotationAction,
} from "@/app/projects/costing-actions";
import {
  costingEntryStatuses,
  costingSources,
  costingWorkflowStatuses,
  costingWorkCategories,
  formatIndianRupees,
  quotationStatuses,
  type CostingEntry,
  type CostingQuotationWorkspaceData,
  type QuotationVersion,
} from "@/server/costing-quotation/costing-domain";

const blankEntry = {
  workCategory: "",
  costingSource: "Internal",
  vendorParty: "",
  costAmount: "",
  costingLink: "",
  status: "Awaiting",
  notes: "",
};

const blankQuotation = {
  quotationDate: "",
  quotationAmount: "",
  quotationLink: "",
  status: "Draft",
  notes: "",
};

export function PersistentCostingWorkspace({
  projectId,
  workspace,
  loadError,
}: {
  projectId: string;
  workspace: CostingQuotationWorkspaceData | null;
  loadError: boolean;
}) {
  const router = useRouter();
  const [requirementOpen, setRequirementOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(
    null,
  );
  const [entryValues, setEntryValues] = useState(blankEntry);
  const [quotationValues, setQuotationValues] = useState(blankQuotation);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (loadError || !workspace) {
    return (
      <section className="panel mt-5 p-5" aria-labelledby="costing-heading">
        <h2 id="costing-heading" className="font-bold">
          Costing &amp; Quotation
        </h2>
        <p className="mt-2 text-sm text-amber-900">
          Costing persistence is unavailable until the reviewed migration is
          applied.
        </p>
      </section>
    );
  }

  const { requirement, entries, quotations, summary } = workspace;
  const finish = (
    result: {
      success: boolean;
      error?: string;
      fieldErrors?: Record<string, string>;
    },
    successMessage: string,
  ) => {
    if (!result.success) {
      setErrors(result.fieldErrors ?? {});
      setMessage(result.error ?? "The change could not be saved.");
      setIsError(true);
      return false;
    }
    setErrors({});
    setMessage(successMessage);
    setIsError(false);
    router.refresh();
    return true;
  };

  const editEntry = (entry: CostingEntry) => {
    setEditingEntryId(entry.id);
    setEntryValues({
      workCategory: entry.workCategory,
      costingSource: entry.costingSource,
      vendorParty: entry.vendorParty ?? "",
      costAmount: entry.costAmount,
      costingLink: entry.costingLink ?? "",
      status: entry.status === "Cancelled" ? "Awaiting" : entry.status,
      notes: entry.notes ?? "",
    });
    setErrors({});
    setEntryOpen(true);
  };

  const editQuotation = (quotation: QuotationVersion) => {
    setEditingQuotationId(quotation.id);
    setQuotationValues({
      quotationDate: quotation.quotationDate,
      quotationAmount: quotation.quotationAmount,
      quotationLink: quotation.quotationLink ?? "",
      status: quotation.status,
      notes: quotation.notes ?? "",
    });
    setErrors({});
    setQuotationOpen(true);
  };

  return (
    <section id="costing-quotation" className="mt-5 space-y-5">
      <div>
        <p className="eyebrow">Pre-PO commercial control</p>
        <h2 id="costing-heading" className="mt-1 text-xl font-bold">
          Costing &amp; Quotation
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Workflow, amounts, and document links are stored here. Detailed BOQs
          and calculations remain in Google Drive or Sheets.
        </p>
      </div>

      <section className="panel overflow-hidden">
        <SectionHeader title="Summary" />
        <dl className="grid sm:grid-cols-2 lg:grid-cols-5">
          <Summary label="Costing Status" value={summary.costingStatus} />
          <Summary
            label="Active Costing Entries"
            value={String(summary.activeCostingEntryCount)}
          />
          <Summary
            label="Recorded Costing Amount"
            value={formatIndianRupees(summary.recordedCostingAmount)}
            note="Recorded entries only; not Final Project Cost."
          />
          <Summary
            label="Latest Quotation"
            value={
              summary.latestQuotationVersion
                ? `${summary.latestQuotationVersion} · ${formatIndianRupees(summary.latestQuotationAmount)}`
                : "—"
            }
          />
          <Summary
            label="Final Quotation Value"
            value={formatIndianRupees(summary.finalQuotationValue)}
          />
        </dl>
      </section>

      <section className="panel overflow-hidden">
        <SectionHeader
          title="Requirement / BOQ"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setRequirementOpen((open) => !open)}
            >
              Edit
            </button>
          }
        />
        {requirementOpen ? (
          <form
            className="grid gap-4 bg-slate-50 p-5 md:grid-cols-2"
            action={(formData) => {
              startTransition(async () => {
                const result = await saveCostingRequirementAction({
                  projectId,
                  requirementReceivedDate: String(
                    formData.get("requirementReceivedDate") ?? "",
                  ),
                  requirementBoqLink: String(
                    formData.get("requirementBoqLink") ?? "",
                  ),
                  scopeNotes: String(formData.get("scopeNotes") ?? ""),
                  costingStatus: String(formData.get("costingStatus") ?? ""),
                });
                if (finish(result, "Requirement / BOQ updated.")) {
                  setRequirementOpen(false);
                }
              });
            }}
          >
            <Field
              name="requirementReceivedDate"
              label="Received Date"
              type="date"
              defaultValue={requirement?.requirementReceivedDate ?? ""}
              required={false}
            />
            <Field
              name="requirementBoqLink"
              label="BOQ / Requirement Link"
              type="url"
              defaultValue={requirement?.requirementBoqLink ?? ""}
              required={false}
            />
            <Select
              name="costingStatus"
              label="Costing Status"
              options={costingWorkflowStatuses}
              defaultValue={requirement?.costingStatus ?? "Not Started"}
            />
            <label className="field md:col-span-2">
              <span>Scope Notes</span>
              <textarea
                name="scopeNotes"
                className="control min-h-20"
                defaultValue={requirement?.scopeNotes ?? ""}
              />
            </label>
            <FormActions
              pending={isPending}
              onCancel={() => setRequirementOpen(false)}
            />
          </form>
        ) : (
          <dl className="grid p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Summary
              label="Received Date"
              value={formatDate(requirement?.requirementReceivedDate)}
            />
            <Summary
              label="BOQ / Requirement"
              value={requirement?.requirementBoqLink ? "Link available" : "—"}
            />
            <Summary
              label="Costing Status"
              value={requirement?.costingStatus ?? "Not Started"}
            />
            <Summary
              label="Scope Notes"
              value={requirement?.scopeNotes ?? "—"}
            />
          </dl>
        )}
      </section>

      <section className="panel overflow-hidden">
        <SectionHeader
          title="Costing Entries"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setEditingEntryId(null);
                setEntryValues(blankEntry);
                setErrors({});
                setEntryOpen(true);
              }}
            >
              + Add Costing
            </button>
          }
        />
        {entryOpen && (
          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <SelectControlled
              label="Work Category"
              value={entryValues.workCategory}
              options={costingWorkCategories}
              error={errors.workCategory}
              onChange={(value) =>
                setEntryValues((current) => ({
                  ...current,
                  workCategory: value,
                }))
              }
            />
            <SelectControlled
              label="Costing Source"
              value={entryValues.costingSource}
              options={costingSources}
              error={errors.costingSource}
              onChange={(value) =>
                setEntryValues((current) => ({
                  ...current,
                  costingSource: value,
                }))
              }
            />
            <ControlledField
              label="Vendor / Party"
              value={entryValues.vendorParty}
              required={false}
              onChange={(value) =>
                setEntryValues((current) => ({
                  ...current,
                  vendorParty: value,
                }))
              }
            />
            <ControlledField
              label="Cost Amount"
              value={entryValues.costAmount}
              error={errors.amount}
              onChange={(value) =>
                setEntryValues((current) => ({ ...current, costAmount: value }))
              }
            />
            <ControlledField
              label="Costing Link"
              type="url"
              value={entryValues.costingLink}
              required={false}
              onChange={(value) =>
                setEntryValues((current) => ({
                  ...current,
                  costingLink: value,
                }))
              }
            />
            <SelectControlled
              label="Status"
              value={entryValues.status}
              options={costingEntryStatuses.filter(
                (status) => status !== "Cancelled",
              )}
              onChange={(value) =>
                setEntryValues((current) => ({ ...current, status: value }))
              }
            />
            <label className="field md:col-span-2">
              <span>Notes</span>
              <textarea
                className="control min-h-20"
                value={entryValues.notes}
                onChange={(event) =>
                  setEntryValues((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </label>
            <FormActions
              pending={isPending}
              onCancel={() => setEntryOpen(false)}
              onSave={() =>
                startTransition(async () => {
                  const result = await saveCostingEntryAction(editingEntryId, {
                    projectId,
                    ...entryValues,
                  });
                  if (
                    finish(
                      result,
                      editingEntryId ? "Costing updated." : "Costing added.",
                    )
                  ) {
                    setEntryOpen(false);
                  }
                })
              }
            />
          </div>
        )}
        <CompactTable
          headings={[
            "Category",
            "Source",
            "Vendor / Party",
            "Cost Amount",
            "Status",
            "Link",
            "Actions",
          ]}
          empty={entries.length === 0}
          emptyText="No costing entries have been recorded."
        >
          {entries.map((entry) => (
            <tr key={entry.id}>
              <Cell>{entry.workCategory}</Cell>
              <Cell>{entry.costingSource}</Cell>
              <Cell>{entry.vendorParty ?? "—"}</Cell>
              <Cell>{formatIndianRupees(entry.costAmount)}</Cell>
              <Cell>{entry.status}</Cell>
              <Cell>{link(entry.costingLink, "Open Costing ↗")}</Cell>
              <Cell>
                {entry.status === "Cancelled" ? (
                  <span className="text-xs text-slate-500">
                    History retained
                  </span>
                ) : (
                  <div className="flex gap-3">
                    <Action onClick={() => editEntry(entry)}>Edit</Action>
                    <Action
                      danger
                      onClick={() =>
                        startTransition(async () => {
                          finish(
                            await cancelCostingEntryAction(entry.id, projectId),
                            "Costing entry cancelled.",
                          );
                        })
                      }
                    >
                      Cancel
                    </Action>
                  </div>
                )}
              </Cell>
            </tr>
          ))}
        </CompactTable>
      </section>

      <section className="panel overflow-hidden">
        <SectionHeader
          title="Client Quotations"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setEditingQuotationId(null);
                setQuotationValues(blankQuotation);
                setErrors({});
                setQuotationOpen(true);
              }}
            >
              + Add Quotation
            </button>
          }
        />
        {quotationOpen && (
          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            {!editingQuotationId && (
              <p className="md:col-span-2 text-sm text-slate-600">
                The server assigns the next project-specific version number.
              </p>
            )}
            <ControlledField
              label="Quotation Date"
              type="date"
              value={quotationValues.quotationDate}
              error={errors.date}
              onChange={(value) =>
                setQuotationValues((current) => ({
                  ...current,
                  quotationDate: value,
                }))
              }
            />
            <ControlledField
              label="Quotation Amount"
              value={quotationValues.quotationAmount}
              error={errors.amount}
              onChange={(value) =>
                setQuotationValues((current) => ({
                  ...current,
                  quotationAmount: value,
                }))
              }
            />
            <ControlledField
              label="Quotation Link"
              type="url"
              value={quotationValues.quotationLink}
              required={false}
              onChange={(value) =>
                setQuotationValues((current) => ({
                  ...current,
                  quotationLink: value,
                }))
              }
            />
            <SelectControlled
              label="Status"
              value={quotationValues.status}
              options={quotationStatuses.filter(
                (status) => status !== "Superseded",
              )}
              onChange={(value) =>
                setQuotationValues((current) => ({ ...current, status: value }))
              }
            />
            <label className="field md:col-span-2">
              <span>Notes</span>
              <textarea
                className="control min-h-20"
                value={quotationValues.notes}
                onChange={(event) =>
                  setQuotationValues((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </label>
            <FormActions
              pending={isPending}
              onCancel={() => setQuotationOpen(false)}
              onSave={() =>
                startTransition(async () => {
                  const result = await saveQuotationAction(editingQuotationId, {
                    projectId,
                    ...quotationValues,
                  });
                  if (
                    finish(
                      result,
                      editingQuotationId
                        ? "Draft quotation updated."
                        : "Quotation version added.",
                    )
                  ) {
                    setQuotationOpen(false);
                  }
                })
              }
            />
          </div>
        )}
        <CompactTable
          headings={[
            "Version",
            "Quotation Date",
            "Amount",
            "Status",
            "Link",
            "Actions",
          ]}
          empty={quotations.length === 0}
          emptyText="No quotation versions have been recorded."
        >
          {quotations.map((quotation) => (
            <tr key={quotation.id}>
              <Cell strong>V{quotation.versionNumber}</Cell>
              <Cell>{formatDate(quotation.quotationDate)}</Cell>
              <Cell>{formatIndianRupees(quotation.quotationAmount)}</Cell>
              <Cell>{quotation.status}</Cell>
              <Cell>{link(quotation.quotationLink, "Open Quotation ↗")}</Cell>
              <Cell>
                <div className="flex gap-3">
                  {quotation.status === "Draft" && (
                    <Action onClick={() => editQuotation(quotation)}>
                      Edit Draft
                    </Action>
                  )}
                  {quotation.status === "Submitted" && (
                    <Action
                      onClick={() =>
                        startTransition(async () => {
                          finish(
                            await markQuotationFinalAction(
                              quotation.id,
                              projectId,
                            ),
                            `V${quotation.versionNumber} marked Final.`,
                          );
                        })
                      }
                    >
                      Mark Final
                    </Action>
                  )}
                  {quotation.status === "Superseded" && (
                    <span className="text-xs text-slate-500">
                      History retained
                    </span>
                  )}
                </div>
              </Cell>
            </tr>
          ))}
        </CompactTable>
      </section>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-900" : "bg-blue-50 text-blue-900"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}
    </section>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
      <h3 className="font-bold">{title}</h3>
      {action}
    </div>
  );
}

function Summary({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 lg:border-r">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold">{value}</dd>
      {note && <dd className="mt-1 text-xs text-slate-500">{note}</dd>}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="text-red-700"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="control"
      />
    </label>
  );
}

function ControlledField({
  label,
  type = "text",
  value,
  error,
  required = true,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="text-red-700"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`control ${error ? "control-error" : ""}`}
      />
      {error && <span className="error">{error}</span>}
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue: string;
}) {
  return (
    <label className="field">
      <span>
        {label} <span className="text-red-700">*</span>
      </span>
      <select name={name} defaultValue={defaultValue} className="control">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function SelectControlled({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>
        {label} <span className="text-red-700">*</span>
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`control ${error ? "control-error" : ""}`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </label>
  );
}

function FormActions({
  pending,
  onCancel,
  onSave,
}: {
  pending: boolean;
  onCancel: () => void;
  onSave?: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 md:col-span-2">
      <button
        type="button"
        className="button button-secondary"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type={onSave ? "button" : "submit"}
        className="button button-primary"
        disabled={pending}
        onClick={onSave}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function CompactTable({
  headings,
  empty,
  emptyText,
  children,
}: {
  headings: string[];
  empty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {headings.map((heading) => (
              <th key={heading} className="px-4 py-3 font-bold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {children}
          {empty && (
            <tr>
              <td
                colSpan={headings.length}
                className="px-5 py-10 text-center text-slate-500"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <td className={`px-4 py-4 ${strong ? "font-semibold" : ""}`}>{children}</td>
  );
}

function Action({
  children,
  onClick,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-bold hover:underline ${danger ? "text-red-700" : "text-blue-800"}`}
    >
      {children}
    </button>
  );
}

function link(url: string | null, label: string) {
  return url && /^https?:\/\//i.test(url) ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-blue-800 hover:underline"
    >
      {label}
    </a>
  ) : (
    "—"
  );
}

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "—";
}
