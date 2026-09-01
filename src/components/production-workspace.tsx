"use client";

import { useState, type FormEvent } from "react";
import {
  dispatchStatuses,
  type DispatchRecord,
  type ProductionRecord,
} from "@/lib/production-data";
import {
  deriveQCStatus,
  getDispatchSummary,
  getFixtureDispatchedQty,
  getProductionHealth,
  getProductionProgress,
  validateDispatchItems,
} from "@/lib/production-utils";
import { formatTaskDate } from "@/lib/task-timing";

export function ProductionWorkspace({
  records,
  initialDispatches = [],
}: {
  records: ProductionRecord[];
  initialDispatches?: DispatchRecord[];
}) {
  const [selectedId, setSelectedId] = useState(records[0]?.id ?? "");
  const [dispatches, setDispatches] = useState(initialDispatches);
  const selected = records.find((record) => record.id === selectedId);
  const dispatchSummary = getDispatchSummary(records, dispatches);
  return (
    <section className="space-y-5" aria-labelledby="production-heading">
      <div>
        <p className="eyebrow">Production</p>
        <h2 id="production-heading" className="mt-1 text-xl font-bold">
          Fixture &amp; Batch Tracking
        </h2>
        <p className="subtle mt-1 text-sm">
          One record represents one fixture type or batch, not one physical
          unit.
        </p>
      </div>
      <div className="panel grid grid-cols-2 overflow-hidden sm:grid-cols-4 lg:grid-cols-7">
        <Metric label="Required" value={dispatchSummary.totalRequiredQty} />
        <Metric label="Produced" value={dispatchSummary.totalProducedQty} />
        <Metric label="QC Passed" value={dispatchSummary.totalQCPassedQty} />
        <Metric label="Packed" value={dispatchSummary.totalPackedQty} />
        <Metric label="Dispatched" value={dispatchSummary.totalDispatchedQty} />
        <Metric
          label="Pending Dispatch"
          value={dispatchSummary.pendingDispatchQty}
        />
        <Metric
          label="Dispatch Status"
          value={dispatchSummary.dispatchStatus}
        />
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {[
                "Fixture",
                "Required Qty",
                "Completed",
                "Pending",
                "Packed",
                "Status",
                "Internal Deadline",
                "Health",
                "QC",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const progress = getProductionProgress(record);
              const health = getProductionHealth(record);
              return (
                <tr
                  key={record.id}
                  className={`cursor-pointer border-b border-slate-100 ${selectedId === record.id ? "bg-blue-50/50" : ""}`}
                  onClick={() => setSelectedId(record.id)}
                >
                  <td className="px-4 py-4 font-bold text-blue-900">
                    {record.fixtureName}
                  </td>
                  <td className="px-4 py-4">{record.requiredQty}</td>
                  <td className="px-4 py-4">{record.completedQty}</td>
                  <td className="px-4 py-4">{progress.pendingQty}</td>
                  <td className="px-4 py-4">{record.packedQty}</td>
                  <td className="px-4 py-4">
                    <Badge>{record.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    {formatTaskDate(record.internalDeadline)}
                  </td>
                  <td
                    className={`px-4 py-4 font-bold ${health.health === "Overdue" ? "text-red-700" : ""}`}
                  >
                    {health.label}
                  </td>
                  <td className="px-4 py-4">{deriveQCStatus(record.qc)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {records.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No production fixture types have been added.
          </p>
        )}
      </div>
      {selected && (
        <ProductionDetail
          record={selected}
          dispatchedQty={getFixtureDispatchedQty(selected.id, dispatches)}
        />
      )}
      <DispatchSection
        records={records}
        dispatches={dispatches}
        onChange={setDispatches}
      />
    </section>
  );
}

function ProductionDetail({
  record,
  dispatchedQty,
}: {
  record: ProductionRecord;
  dispatchedQty: number;
}) {
  const progress = getProductionProgress(record);
  const health = getProductionHealth(record);
  const qcStatus = deriveQCStatus(record.qc);
  return (
    <section className="panel space-y-4 p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div>
          <p className="eyebrow">{record.id}</p>
          <h3 className="mt-1 text-lg font-bold">{record.fixtureName}</h3>
        </div>
        <Badge>{record.status}</Badge>
      </div>
      <Detail title="Production Summary">
        <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Required" value={String(record.requiredQty)} />
          <Fact label="Completed" value={String(record.completedQty)} />
          <Fact label="Pending" value={String(progress.pendingQty)} />
          <Fact label="Complete" value={`${progress.completionPercent}%`} />
          <Fact
            label="Packed"
            value={`${record.packedQty} (${progress.packedPendingQty} pending)`}
          />
          <Fact label="Health" value={health.label} />
          <Fact
            label="Dispatched"
            value={`${dispatchedQty} / ${record.requiredQty}`}
          />
        </dl>
        {health.health === "Overdue" && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800">
            {record.delayReason || "Delay reason not recorded"} ·{" "}
            {record.delayNotes || "No delay notes"}
          </p>
        )}
      </Detail>
      <Detail title="Drawing">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Fact label="Version" value={record.drawingVersion} />
          <Fact
            label="Planned Start"
            value={formatTaskDate(record.plannedStartDate)}
          />
          <Fact
            label="Actual Start"
            value={formatTaskDate(record.actualStartDate)}
          />
        </dl>
        {record.drawingLink && (
          <ExternalLink href={record.drawingLink}>Open Drawing ↗</ExternalLink>
        )}
      </Detail>
      <Detail title="Material">
        <Fact label="Status" value={record.materialStatus} />
        {record.materialRequirementLink && (
          <ExternalLink href={record.materialRequirementLink}>
            Open Material Requirement ↗
          </ExternalLink>
        )}
      </Detail>
      <Detail title="Processes">
        <div className="flex flex-wrap gap-2">
          {record.processes.map((process) => (
            <span
              key={`${process.name}-${process.executionType}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"
            >
              {process.name} · {process.executionType}
            </span>
          ))}
        </div>
      </Detail>
      <Detail title="Labour / Taker">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Fact label="Team / Taker" value={record.labour.teamOrTakerName} />
          <Fact label="Agreed Cost" value={record.labour.agreedLabourCost} />
          <Fact label="Advance Paid" value={record.labour.advancePaid} />
          <Fact label="Balance" value={record.labour.balanceAmount} />
        </dl>
        <p className="mt-2 text-sm text-slate-500">{record.labour.notes}</p>
      </Detail>
      <Detail title="QC">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Fact label="QC Status" value={qcStatus} />
          <Fact label="Checked" value={String(record.qc.checkedQty)} />
          <Fact label="Passed" value={String(record.qc.passedQty)} />
          <Fact label="Rework" value={String(record.qc.reworkQty)} />
          <Fact label="QC Date" value={formatTaskDate(record.qc.qcDate)} />
          <Fact label="QC Person" value={record.qc.qcPerson} />
          <Fact
            label="Rework Deadline"
            value={formatTaskDate(record.qc.reworkDeadline)}
          />
        </dl>
        {qcStatus === "Rework Required" && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            {record.qc.reworkNotes}
          </p>
        )}
        <div className="mt-3 flex gap-4">
          {record.qc.qcChecklistLink && (
            <ExternalLink href={record.qc.qcChecklistLink}>
              Open QC Checklist ↗
            </ExternalLink>
          )}
          {record.qc.qcPhotosLink && (
            <ExternalLink href={record.qc.qcPhotosLink}>
              Open QC Photos ↗
            </ExternalLink>
          )}
        </div>
      </Detail>
      <Detail title="Notes">
        <p className="text-sm text-slate-600">
          {record.notes || "No notes recorded."}
        </p>
      </Detail>
    </section>
  );
}

function DispatchSection({
  records,
  dispatches,
  onChange,
}: {
  records: ProductionRecord[];
  dispatches: DispatchRecord[];
  onChange: (dispatches: DispatchRecord[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const summary = getDispatchSummary(records, dispatches);
  const recent = [...dispatches].sort((a, b) =>
    b.dispatchDate.localeCompare(a.dispatchDate),
  );
  const visible = viewAll ? recent : recent.slice(0, 3);
  const editing = dispatches.find((dispatch) => dispatch.id === editingId);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const items = records.flatMap((record) => {
      const quantity = Number(data.get(`fixture-${record.id}`) || 0);
      return quantity > 0 ? [{ fixtureId: record.id, quantity }] : [];
    });
    const otherDispatches = dispatches.filter(
      (dispatch) => dispatch.id !== editingId,
    );
    const validation = validateDispatchItems(items, records, otherDispatches);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    const dispatch: DispatchRecord = {
      id: editing?.id ?? `DSP-${Date.now()}`,
      jobCode: records[0]?.jobCode ?? "",
      dispatchDate: String(data.get("dispatchDate")),
      destination: String(data.get("destination")),
      items,
      vehicleOrTransporter: String(data.get("vehicleOrTransporter")),
      driverOrContact: String(data.get("driverOrContact")),
      dispatchDocumentLink: String(data.get("dispatchDocumentLink")),
      notes: String(data.get("notes")),
      status: data.get("status") as DispatchRecord["status"],
      cancellationReason: "",
      cancellationDate: "",
    };
    onChange(
      editing
        ? dispatches.map((item) => (item.id === editing.id ? dispatch : item))
        : [...dispatches, dispatch],
    );
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function cancelDispatch(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onChange(
      dispatches.map((dispatch) =>
        dispatch.id === id
          ? {
              ...dispatch,
              status: "Cancelled",
              cancellationReason: String(data.get("cancellationReason")),
              cancellationDate: browserDate(),
            }
          : dispatch,
      ),
    );
    setCancellingId(null);
  }

  return (
    <section className="panel p-5" aria-labelledby="dispatch-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Dispatch</p>
          <h3 id="dispatch-heading" className="mt-1 text-lg font-bold">
            {summary.dispatchStatus}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {summary.totalDispatchedQty} dispatched ·{" "}
            {summary.pendingDispatchQty} pending
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          Create Dispatch
        </button>
      </div>
      {showForm && (
        <DispatchForm
          records={records}
          initial={editing}
          error={error}
          onSubmit={save}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
            setError("");
          }}
        />
      )}
      <div className="mt-5 flex items-center justify-between">
        <h4 className="font-bold">Recent Dispatches</h4>
        {recent.length > 3 && (
          <button
            className="text-sm font-bold text-blue-800"
            type="button"
            onClick={() => setViewAll((value) => !value)}
          >
            {viewAll ? "Show Latest 3" : "View All"}
          </button>
        )}
      </div>
      <div className="mt-3 divide-y rounded-xl border">
        {visible.map((dispatch) => (
          <article
            key={dispatch.id}
            className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start"
          >
            <div>
              <p className="font-bold">{dispatch.destination}</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatTaskDate(dispatch.dispatchDate)} ·{" "}
                {dispatch.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                qty · {dispatch.status}
              </p>
              {dispatch.status === "Cancelled" && (
                <p className="mt-1 text-xs text-red-700">
                  Cancelled {formatTaskDate(dispatch.cancellationDate)} ·{" "}
                  {dispatch.cancellationReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2">
              {dispatch.dispatchDocumentLink && (
                <ExternalLink href={dispatch.dispatchDocumentLink}>
                  Open Dispatch Document ↗
                </ExternalLink>
              )}
              {dispatch.status === "Draft" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-bold text-blue-800"
                    onClick={() => {
                      setEditingId(dispatch.id);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold text-red-700"
                    onClick={() =>
                      onChange(
                        dispatches.filter((item) => item.id !== dispatch.id),
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
              {dispatch.status === "Dispatched" && (
                <button
                  type="button"
                  className="text-sm font-bold text-red-700"
                  onClick={() => setCancellingId(dispatch.id)}
                >
                  Cancel Dispatch
                </button>
              )}
              {cancellingId === dispatch.id && (
                <form
                  className="flex gap-2"
                  onSubmit={(event) => cancelDispatch(event, dispatch.id)}
                >
                  <input
                    className="control min-h-9"
                    name="cancellationReason"
                    placeholder="Cancellation reason"
                    required
                  />
                  <button className="button button-secondary" type="submit">
                    Confirm
                  </button>
                </form>
              )}
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No dispatch records.</p>
        )}
      </div>
    </section>
  );
}

function DispatchForm({
  records,
  initial,
  error,
  onSubmit,
  onCancel,
}: {
  records: ProductionRecord[];
  initial?: DispatchRecord;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="mt-4 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:grid-cols-2"
      onSubmit={onSubmit}
    >
      <Input
        name="dispatchDate"
        label="Dispatch Date"
        type="date"
        defaultValue={initial?.dispatchDate}
        required
      />
      <Input
        name="destination"
        label="Destination"
        defaultValue={initial?.destination}
        required
      />
      {records.map((record) => (
        <Input
          key={record.id}
          name={`fixture-${record.id}`}
          label={`${record.fixtureName} quantity`}
          type="number"
          min="0"
          defaultValue={String(
            initial?.items.find((item) => item.fixtureId === record.id)
              ?.quantity ?? 0,
          )}
        />
      ))}
      <Input
        name="vehicleOrTransporter"
        label="Vehicle / Transporter (optional)"
        defaultValue={initial?.vehicleOrTransporter}
      />
      <Input
        name="driverOrContact"
        label="Driver / Contact (optional)"
        defaultValue={initial?.driverOrContact}
      />
      <Input
        name="dispatchDocumentLink"
        label="Dispatch Document Link (optional)"
        type="url"
        defaultValue={initial?.dispatchDocumentLink}
      />
      <label className="field">
        <span>Status</span>
        <select
          className="control"
          name="status"
          defaultValue={initial?.status}
        >
          {dispatchStatuses
            .filter((status) => status !== "Cancelled")
            .map((status) => (
              <option key={status}>{status}</option>
            ))}
        </select>
      </label>
      <Input name="notes" label="Notes" defaultValue={initial?.notes} />
      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-red-700 sm:col-span-2"
        >
          {error}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button className="button button-primary" type="submit">
          Save Dispatch
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
  name,
  label,
  type = "text",
  min,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  min?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="control"
        name={name}
        type={type}
        min={min}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-r p-3">
      <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
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
function Detail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h4 className="mb-3 font-bold">{title}</h4>
      {children}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value || "—"}</dd>
    </div>
  );
}
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-block text-sm font-bold text-blue-800 hover:underline"
    >
      {children}
    </a>
  );
}
function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">
      {children}
    </span>
  );
}
