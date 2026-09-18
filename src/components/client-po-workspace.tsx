"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelClientPoAction,
  saveClientPoAction,
} from "@/app/projects/client-po-actions";
import {
  formatIndianRupees,
  getClientPurchaseOrderSummary,
  type ClientPurchaseOrder,
} from "@/server/client-purchase-orders/client-po-domain";

type FormValues = {
  poNumber: string;
  poDate: string;
  poAmount: string;
  poDocumentLink: string;
  notes: string;
};

const blankForm: FormValues = {
  poNumber: "",
  poDate: "",
  poAmount: "",
  poDocumentLink: "",
  notes: "",
};

export function ClientPoWorkspace({
  projectId,
  purchaseOrders,
  loadError = false,
}: {
  projectId: string;
  purchaseOrders: ClientPurchaseOrder[];
  loadError?: boolean;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState(blankForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const summary = getClientPurchaseOrderSummary(purchaseOrders);

  const openAdd = () => {
    setEditingId(null);
    setValues(blankForm);
    setFieldErrors({});
    setMessage("");
    setFormOpen(true);
  };

  const openEdit = (purchaseOrder: ClientPurchaseOrder) => {
    setEditingId(purchaseOrder.id);
    setValues({
      poNumber: purchaseOrder.poNumber,
      poDate: purchaseOrder.poDate,
      poAmount: purchaseOrder.poAmount,
      poDocumentLink: purchaseOrder.poDocumentLink ?? "",
      notes: purchaseOrder.notes ?? "",
    });
    setFieldErrors({});
    setMessage("");
    setFormOpen(true);
  };

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = () => {
    startTransition(async () => {
      const result = await saveClientPoAction(editingId, {
        projectId,
        ...values,
      });
      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.error ?? "The Client PO could not be saved.");
        setIsError(true);
        return;
      }
      setFormOpen(false);
      setValues(blankForm);
      setMessage(editingId ? "Client PO updated." : "Client PO added.");
      setIsError(false);
      router.refresh();
    });
  };

  const cancel = (id: string) => {
    startTransition(async () => {
      const result = await cancelClientPoAction(id, projectId);
      setMessage(
        result.success
          ? "Client PO cancelled and retained in history."
          : (result.error ?? "Cancellation failed."),
      );
      setIsError(!result.success);
      if (result.success) router.refresh();
    });
  };

  return (
    <section
      className="panel mt-5 overflow-hidden"
      aria-labelledby="client-po-heading"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center lg:px-7">
        <div>
          <p className="eyebrow">Commercial</p>
          <h2 id="client-po-heading" className="mt-1 font-bold">
            Client Purchase Orders
          </h2>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={openAdd}
          disabled={loadError || isPending}
        >
          + Add PO
        </button>
      </div>

      <dl className="grid border-b border-slate-200 sm:grid-cols-2">
        <Summary label="Active PO Count" value={`${summary.activeCount}`} />
        <Summary
          label="Total PO Value"
          value={formatIndianRupees(summary.totalPoValue)}
        />
      </dl>

      {loadError && (
        <div
          className="m-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          Client PO persistence is unavailable until the reviewed migration is
          applied.
        </div>
      )}

      {formOpen && !loadError && (
        <div className="border-b border-slate-200 bg-slate-50 p-5 lg:p-7">
          <h3 className="font-bold">
            {editingId ? "Edit Client PO" : "Add Client PO"}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="PO Number"
              value={values.poNumber}
              error={fieldErrors.poNumber}
              onChange={(value) => update("poNumber", value)}
            />
            <Field
              label="PO Date"
              type="date"
              value={values.poDate}
              error={fieldErrors.poDate}
              onChange={(value) => update("poDate", value)}
            />
            <Field
              label="PO Amount"
              value={values.poAmount}
              inputMode="decimal"
              error={fieldErrors.poAmount}
              onChange={(value) => update("poAmount", value)}
            />
            <Field
              label="PO Document / Drive Link"
              type="url"
              value={values.poDocumentLink}
              required={false}
              onChange={(value) => update("poDocumentLink", value)}
            />
            <label className="field md:col-span-2">
              <span>Notes</span>
              <textarea
                className="control min-h-20"
                value={values.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={submit}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save PO"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mx-5 mt-5 rounded-lg px-4 py-3 text-sm lg:mx-7 ${isError ? "bg-red-50 text-red-900" : "bg-blue-50 text-blue-900"}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </div>
      )}

      {!loadError && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "PO Number",
                  "PO Date",
                  "PO Amount",
                  "Document",
                  "Status",
                  "Notes",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((purchaseOrder) => (
                <tr key={purchaseOrder.id} className="align-top">
                  <td className="px-4 py-4 font-semibold">
                    {purchaseOrder.poNumber}
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(purchaseOrder.poDate)}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {formatIndianRupees(purchaseOrder.poAmount)}
                  </td>
                  <td className="px-4 py-4">
                    {safeDocumentLink(purchaseOrder.poDocumentLink) ? (
                      <a
                        href={purchaseOrder.poDocumentLink!}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-800 hover:underline"
                      >
                        Open PO ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${purchaseOrder.status === "Active" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      {purchaseOrder.status}
                    </span>
                  </td>
                  <td className="max-w-64 px-4 py-4 text-slate-600">
                    {purchaseOrder.notes || "—"}
                  </td>
                  <td className="px-4 py-4">
                    {purchaseOrder.status === "Active" ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="font-bold text-blue-800 hover:underline"
                          onClick={() => openEdit(purchaseOrder)}
                          disabled={isPending}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="font-bold text-red-700 hover:underline"
                          onClick={() => cancel(purchaseOrder.id)}
                          disabled={isPending}
                        >
                          Cancel PO
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">
                        History retained
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No Client POs have been added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 lg:px-7">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function Field({
  label,
  type = "text",
  inputMode,
  value,
  error,
  required = true,
  onChange,
}: {
  label: string;
  type?: string;
  inputMode?: "decimal";
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>
        {label} {required && <span className="text-red-700">*</span>}
      </span>
      <input
        className={`control ${error ? "control-error" : ""}`}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <span className="error">{error}</span>}
    </label>
  );
}

function safeDocumentLink(value: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
