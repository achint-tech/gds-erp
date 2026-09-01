"use client";

import { useState } from "react";
import type { ProductionRecord } from "@/lib/production-data";
import {
  deriveQCStatus,
  getProductionHealth,
  getProductionProgress,
} from "@/lib/production-utils";
import { formatTaskDate } from "@/lib/task-timing";

export function ProductionWorkspace({
  records,
}: {
  records: ProductionRecord[];
}) {
  const [selectedId, setSelectedId] = useState(records[0]?.id ?? "");
  const selected = records.find((record) => record.id === selectedId);
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
      {selected && <ProductionDetail record={selected} />}
    </section>
  );
}

function ProductionDetail({ record }: { record: ProductionRecord }) {
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
