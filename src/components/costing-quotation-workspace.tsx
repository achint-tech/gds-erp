"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  displayValue,
  getAdditionalWorkCategories,
  getRecommendedWorkCategories,
  hasRequiredUrl,
  hasWorkCategorySelection,
} from "@/lib/costing-utils";
import {
  costingDocumentTypes,
  costingSourceStatuses,
  costingSourceTypes,
  quotationStatuses,
  workCategories,
  type CostingDocument,
  type CostingDocumentType,
  type CostingSource,
  type CostingSourceStatus,
  type CostingSourceType,
  type CostingWorkspaceData,
  type QuotationStatus,
  type QuotationVersion,
  type WorkCategory,
  type ProjectType,
} from "@/lib/prototype-data";

type ModalName = "document" | "source" | "quotation" | null;

export function CostingQuotationWorkspace({
  jobCode,
  owner,
  projectType,
  initialData,
}: {
  jobCode: string;
  owner: string;
  projectType: ProjectType;
  initialData?: CostingWorkspaceData;
}) {
  const [documents, setDocuments] = useState<CostingDocument[]>(
    initialData?.documents ?? [],
  );
  const [sources, setSources] = useState<CostingSource[]>(
    initialData?.sources ?? [],
  );
  const [quotations, setQuotations] = useState<QuotationVersion[]>(
    initialData?.quotations ?? [],
  );
  const [modal, setModal] = useState<ModalName>(null);
  const [documentUrlError, setDocumentUrlError] = useState("");
  const [sourceCategoryError, setSourceCategoryError] = useState("");
  const [showAdditionalCategories, setShowAdditionalCategories] =
    useState(false);
  const summary = initialData?.summary;
  const recommendedCategories = getRecommendedWorkCategories(projectType);
  const additionalCategories = getAdditionalWorkCategories(projectType);
  const visibleCategories = showAdditionalCategories
    ? workCategories
    : recommendedCategories;

  const addDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const url = formValue(form, "url");
    if (!hasRequiredUrl(url)) {
      setDocumentUrlError("Google Sheet / Document URL is required.");
      return;
    }
    setDocuments((current) => [
      ...current,
      {
        id: `LOCAL-DOC-${Date.now()}`,
        projectJobCode: jobCode,
        type: formValue(form, "type") as CostingDocumentType,
        name: formValue(form, "name"),
        url,
        addedBy: owner,
        addedDate: new Date().toISOString().slice(0, 10),
        version: formValue(form, "version"),
        notes: formValue(form, "notes"),
      },
    ]);
    setDocumentUrlError("");
    setModal(null);
  };

  const addSource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedCategories = form
      .getAll("workCategories")
      .map(String) as WorkCategory[];
    if (!hasWorkCategorySelection(selectedCategories)) {
      setSourceCategoryError("Select at least one Work Category.");
      return;
    }
    setSources((current) => [
      ...current,
      {
        sourceId: `LOCAL-SRC-${Date.now()}`,
        projectJobCode: jobCode,
        sourceType: formValue(form, "sourceType") as CostingSourceType,
        workCategories: selectedCategories,
        sourceName: formValue(form, "sourceName"),
        status: formValue(form, "status") as CostingSourceStatus,
        costingLink: formValue(form, "costingLink"),
        amount: formValue(form, "amount"),
        requiredBy: formValue(form, "requiredBy"),
        receivedDate: formValue(form, "receivedDate"),
        notes: formValue(form, "notes"),
      },
    ]);
    setSourceCategoryError("");
    setModal(null);
  };

  const addQuotation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setQuotations((current) => [
      ...current,
      {
        quotationId: `LOCAL-QUO-${Date.now()}`,
        projectJobCode: jobCode,
        version: formValue(form, "version"),
        amount: formValue(form, "amount"),
        quotationLink: formValue(form, "quotationLink"),
        status: formValue(form, "status") as QuotationStatus,
        createdDate: formValue(form, "createdDate"),
        sentDate: formValue(form, "sentDate"),
        notes: formValue(form, "notes"),
      },
    ]);
    setModal(null);
  };

  return (
    <section id="costing-quotation" className="mt-6 space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Pre-PO commercial control</p>
          <h2 className="mt-1 text-xl font-bold">Costing &amp; Quotation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Links and workflow status only. Costing calculations remain in
            existing Google Sheets.
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
          Prototype · Changes are not persisted
        </span>
      </div>

      <section
        className="panel overflow-hidden"
        aria-labelledby="costing-summary-heading"
      >
        <SectionHeader id="costing-summary-heading" title="Costing summary" />
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem
            label="Costing Status"
            value={summary?.costingStatus}
            badge
          />
          <SummaryItem
            label="Costing Owner"
            value={summary?.costingOwner ?? owner}
          />
          <SummaryItem label="Costing Method" value={summary?.costingMethod} />
          <SummaryItem
            label="Final Internal Cost"
            value={summary?.finalInternalCost}
          />
          <SummaryItem
            label="Current Quotation Amount"
            value={summary?.currentQuotationAmount}
          />
          <SummaryItem
            label="Current Quotation Version"
            value={summary?.currentQuotationVersion}
          />
          <SummaryItem
            label="Quotation Status"
            value={summary?.quotationStatus}
            badge
          />
          <SummaryItem
            label="Last Updated"
            value={summary ? formatDateTime(summary.lastUpdated) : ""}
          />
        </dl>
      </section>

      <section
        className="panel overflow-hidden"
        aria-labelledby="costing-documents-heading"
      >
        <SectionHeader
          id="costing-documents-heading"
          title="Costing Documents"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setModal("document")}
            >
              + Add Costing Document
            </button>
          }
        />
        <TableScroll>
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <TableHead
              headings={[
                "Type",
                "Name",
                "Version",
                "Added By",
                "Date",
                "Action",
              ]}
            />
            <tbody className="divide-y divide-slate-100">
              {documents.map((document) => (
                <tr key={document.id}>
                  <Cell>{document.type}</Cell>
                  <Cell strong>{document.name}</Cell>
                  <Cell>{displayValue(document.version)}</Cell>
                  <Cell>{document.addedBy}</Cell>
                  <Cell>{formatDate(document.addedDate)}</Cell>
                  <Cell>
                    <ExternalAction url={document.url} label="Open ↗" />
                  </Cell>
                </tr>
              ))}
              {!documents.length && (
                <EmptyRow
                  columns={6}
                  text="No costing documents are linked in this prototype."
                />
              )}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section
        className="panel overflow-hidden"
        aria-labelledby="costing-sources-heading"
      >
        <SectionHeader
          id="costing-sources-heading"
          title="Costing Sources"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setShowAdditionalCategories(false);
                setModal("source");
              }}
            >
              + Add Costing Source
            </button>
          }
        />
        <TableScroll>
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <TableHead
              headings={[
                "Work Categories",
                "Source",
                "Type",
                "Status",
                "Amount",
                "Action",
              ]}
            />
            <tbody className="divide-y divide-slate-100">
              {sources.map((source) => (
                <tr key={source.sourceId}>
                  <Cell>
                    <div className="flex max-w-72 flex-wrap gap-1.5">
                      {source.workCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </Cell>
                  <Cell strong>{source.sourceName}</Cell>
                  <Cell>{source.sourceType}</Cell>
                  <Cell>
                    <StatusBadge>{source.status}</StatusBadge>
                  </Cell>
                  <Cell>{displayValue(source.amount)}</Cell>
                  <Cell>
                    <ExternalAction
                      url={source.costingLink}
                      label="Open Costing ↗"
                    />
                  </Cell>
                </tr>
              ))}
              {!sources.length && (
                <EmptyRow
                  columns={6}
                  text="No costing sources are recorded in this prototype."
                />
              )}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section
        className="panel overflow-hidden"
        aria-labelledby="quotation-history-heading"
      >
        <SectionHeader
          id="quotation-history-heading"
          title="Quotation History"
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setModal("quotation")}
            >
              + Add Quotation Version
            </button>
          }
        />
        <TableScroll>
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <TableHead
              headings={[
                "Version",
                "Amount",
                "Status",
                "Created",
                "Sent",
                "Action",
              ]}
            />
            <tbody className="divide-y divide-slate-100">
              {quotations.map((quotation) => (
                <tr key={quotation.quotationId}>
                  <Cell strong>{quotation.version}</Cell>
                  <Cell>{quotation.amount}</Cell>
                  <Cell>
                    <StatusBadge>{quotation.status}</StatusBadge>
                  </Cell>
                  <Cell>{formatDate(quotation.createdDate)}</Cell>
                  <Cell>{formatDate(quotation.sentDate)}</Cell>
                  <Cell>
                    <ExternalAction
                      url={quotation.quotationLink}
                      label="Open ↗"
                    />
                  </Cell>
                </tr>
              ))}
              {!quotations.length && (
                <EmptyRow
                  columns={6}
                  text="No quotation versions are recorded in this prototype."
                />
              )}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section
        className="panel overflow-hidden"
        aria-labelledby="commercial-notes-heading"
      >
        <SectionHeader id="commercial-notes-heading" title="Commercial Notes" />
        <ul className="divide-y divide-slate-100">
          {(initialData?.notes ?? []).map((note) => (
            <li
              key={note.id}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-5"
            >
              <time
                className="shrink-0 text-xs font-bold text-slate-500"
                dateTime={note.date}
              >
                {formatDate(note.date)}
              </time>
              <span className="text-sm text-slate-700">{note.note}</span>
            </li>
          ))}
          {!initialData?.notes.length && (
            <li className="px-5 py-8 text-center text-sm text-slate-500">
              No commercial notes are recorded in this prototype.
            </li>
          )}
        </ul>
      </section>

      {modal === "document" && (
        <PrototypeModal
          title="Add Costing Document"
          onClose={() => {
            setModal(null);
            setDocumentUrlError("");
          }}
        >
          <form onSubmit={addDocument} className="grid gap-4">
            <SelectInput
              name="type"
              label="Document Type"
              options={costingDocumentTypes}
              required
            />
            <TextInput name="name" label="Name" required />
            <TextInput
              name="url"
              label="Google Sheet / Document URL"
              type="url"
              error={documentUrlError}
            />
            <TextInput name="version" label="Version" />
            <TextArea name="notes" label="Notes" />
            <ModalActions />
          </form>
        </PrototypeModal>
      )}
      {modal === "source" && (
        <PrototypeModal
          title="Add Costing Source"
          onClose={() => {
            setModal(null);
            setSourceCategoryError("");
            setShowAdditionalCategories(false);
          }}
        >
          <form onSubmit={addSource} className="grid gap-4">
            <SelectInput
              name="sourceType"
              label="Source Type"
              options={costingSourceTypes}
              defaultValue={
                projectType === "Fixtures" ? "Internal Production" : undefined
              }
              required
            />
            <MultiCheckboxInput
              name="workCategories"
              label={
                showAdditionalCategories
                  ? "Work Categories"
                  : "Recommended Work Categories"
              }
              options={visibleCategories}
              error={sourceCategoryError}
            />
            {!showAdditionalCategories && additionalCategories.length > 0 && (
              <button
                type="button"
                className="w-fit text-sm font-bold text-blue-800 hover:underline"
                onClick={() => setShowAdditionalCategories(true)}
              >
                + Show More Categories
              </button>
            )}
            <TextInput name="sourceName" label="Source Name" required />
            <SelectInput
              name="status"
              label="Status"
              options={costingSourceStatuses}
              required
            />
            <TextInput name="costingLink" label="Google Sheet URL" type="url" />
            <TextInput
              name="amount"
              label="Amount"
              placeholder="Example: ₹845,000"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput name="requiredBy" label="Required By" type="date" />
              <TextInput
                name="receivedDate"
                label="Received Date"
                type="date"
              />
            </div>
            <TextArea name="notes" label="Notes" />
            <ModalActions />
          </form>
        </PrototypeModal>
      )}
      {modal === "quotation" && (
        <PrototypeModal
          title="Add Quotation Version"
          onClose={() => setModal(null)}
        >
          <form onSubmit={addQuotation} className="grid gap-4">
            <TextInput
              name="version"
              label="Version"
              placeholder="Example: V3"
              required
            />
            <TextInput
              name="amount"
              label="Quotation Amount"
              placeholder="Example: ₹1,040,000"
              required
            />
            <TextInput
              name="quotationLink"
              label="Google Sheet / Document URL"
              type="url"
              required
            />
            <SelectInput
              name="status"
              label="Status"
              options={quotationStatuses}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                name="createdDate"
                label="Created Date"
                type="date"
                required
              />
              <TextInput name="sentDate" label="Sent Date" type="date" />
            </div>
            <TextArea name="notes" label="Notes" />
            <ModalActions />
          </form>
        </PrototypeModal>
      )}
    </section>
  );
}

function formValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}
function formatDate(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "—";
}
function formatDateTime(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      }).format(new Date(value))
    : "—";
}

function SectionHeader({
  id,
  title,
  action,
}: {
  id: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
      <h3 id={id} className="font-bold">
        {title}
      </h3>
      {action}
    </div>
  );
}
function SummaryItem({
  label,
  value = "",
  badge,
}: {
  label: string;
  value?: string;
  badge?: boolean;
}) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 lg:border-r">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold">
        {badge && value ? (
          <StatusBadge>{value}</StatusBadge>
        ) : (
          displayValue(value)
        )}
      </dd>
    </div>
  );
}
function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">
      {children}
    </span>
  );
}
function TableScroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}
function TableHead({ headings }: { headings: string[] }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
      <tr>
        {headings.map((heading) => (
          <th key={heading} className="px-4 py-3 font-bold">
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  );
}
function Cell({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <td className={`px-4 py-4 ${strong ? "font-semibold" : ""}`}>{children}</td>
  );
}
function EmptyRow({ columns, text }: { columns: number; text: string }) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="px-5 py-10 text-center text-sm text-slate-500"
      >
        {text}
      </td>
    </tr>
  );
}
function ExternalAction({ url, label }: { url: string; label: string }) {
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="whitespace-nowrap text-sm font-bold text-blue-800 hover:underline"
    >
      {label}
    </a>
  ) : (
    <span className="text-slate-400">—</span>
  );
}

function PrototypeModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prototype-modal-title"
        className="panel max-h-[90vh] w-full max-w-xl overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 id="prototype-modal-title" className="font-bold">
              {title}
            </h3>
            <p className="mt-1 text-xs text-amber-700">
              Prototype only · Changes are not persisted
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function TextInput({
  name,
  label,
  type = "text",
  placeholder,
  required,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
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
        placeholder={placeholder}
        required={required}
        className={`control ${error ? "control-error" : ""}`}
        aria-invalid={!!error}
      />
      {error && <span className="error">{error}</span>}
    </label>
  );
}
function SelectInput({
  name,
  label,
  options,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="text-red-700"> *</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="control"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function MultiCheckboxInput({
  name,
  label,
  options,
  error,
}: {
  name: string;
  label: string;
  options: readonly string[];
  error?: string;
}) {
  return (
    <fieldset className="field">
      <legend>
        {label} <span className="text-red-700">*</span>
      </legend>
      <div
        className={`grid max-h-48 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-3 ${error ? "border-red-700 bg-red-50/40" : "border-slate-300"}`}
      >
        {options.map((option) => (
          <label
            key={option}
            className="flex items-start gap-2 text-xs font-medium text-slate-700"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              className="mt-0.5 size-4 accent-blue-800"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && <span className="error">{error}</span>}
    </fieldset>
  );
}
function TextArea({ name, label }: { name: string; label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea name={name} rows={3} className="control resize-y" />
    </label>
  );
}
function ModalActions() {
  return (
    <div className="flex justify-end border-t border-slate-100 pt-4">
      <button type="submit" className="button button-primary">
        Add to prototype
      </button>
    </div>
  );
}
