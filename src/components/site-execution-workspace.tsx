"use client";

import { useState, type FormEvent } from "react";
import type { DispatchRecord, ProductionRecord } from "@/lib/production-data";
import { formatTaskDate } from "@/lib/task-timing";
import {
  handoverStatuses,
  responsiblePartyTypes,
  siteDelayReasons,
  siteQCStatuses,
  siteStatuses,
  siteWorkStatuses,
  workPackageCategories,
  type SiteExecution,
} from "@/lib/site-execution-data";
import {
  getInstallationSummary,
  getSiteDeadlineHealth,
  isHandoverComplete,
  requiresRectification,
} from "@/lib/site-execution-utils";

type Context = {
  jobCode: string;
  projectName: string;
  brand: string;
  projectType: string;
  projectManager: string;
  address: string;
  clientContact: string;
  poReference: string;
};

export function SiteExecutionWorkspace({
  context,
  initialSite,
  productionRecords,
  dispatchRecords,
}: {
  context: Context;
  initialSite?: SiteExecution;
  productionRecords: ProductionRecord[];
  dispatchRecords: DispatchRecord[];
}) {
  const [site, setSite] = useState(initialSite!);
  if (!initialSite)
    return (
      <section className="panel p-5">
        <p className="eyebrow">Site Execution</p>
        <h2 className="mt-1 font-bold">No Site record yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          This local prototype has no Site Execution mock data for{" "}
          {context.jobCode}.
        </p>
      </section>
    );
  const deadline = getSiteDeadlineHealth(site);
  const installation = getInstallationSummary(
    site,
    productionRecords,
    dispatchRecords,
  );
  const rectification = requiresRectification(site);
  const completed = isHandoverComplete(site);
  const update = <K extends keyof SiteExecution>(
    key: K,
    value: SiteExecution[K],
  ) => setSite({ ...site, [key]: value });
  const updatePackage = (
    id: string,
    patch: Partial<SiteExecution["workPackages"][number]>,
  ) =>
    update(
      "workPackages",
      site.workPackages.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  const updateReceipt = (
    fixtureId: string,
    patch: Partial<SiteExecution["fixtureReceipts"][number]>,
  ) => {
    const exists = site.fixtureReceipts.some(
      (item) => item.fixtureId === fixtureId,
    );
    update(
      "fixtureReceipts",
      exists
        ? site.fixtureReceipts.map((item) =>
            item.fixtureId === fixtureId ? { ...item, ...patch } : item,
          )
        : [
            ...site.fixtureReceipts,
            { fixtureId, receivedAtSiteQty: 0, installedQty: 0, ...patch },
          ],
    );
  };

  function addProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update("progressUpdates", [
      {
        id: `SUP-${Date.now()}`,
        date: String(data.get("date")),
        update: String(data.get("update")),
        blockerOrDependency: String(data.get("blocker")),
        nextAction: String(data.get("nextAction")),
      },
      ...site.progressUpdates,
    ]);
    event.currentTarget.reset();
  }

  function addPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update("workPackages", [
      ...site.workPackages,
      {
        id: `SWP-${Date.now()}`,
        category: String(
          data.get("category"),
        ) as SiteExecution["workPackages"][number]["category"],
        responsiblePartyType: String(
          data.get("partyType"),
        ) as SiteExecution["workPackages"][number]["responsiblePartyType"],
        responsiblePartyName: String(data.get("partyName")),
        plannedStartDate: "",
        dueDate: String(data.get("dueDate")),
        actualStartDate: "",
        actualCompletionDate: "",
        status: "Not Started",
        delayReason: "",
        notes: "",
      },
    ]);
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div>
            <p className="eyebrow">Site Summary</p>
            <h2 className="mt-1 text-lg font-bold">
              {completed ? "Site Execution Complete" : site.siteStatus}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {deadline.health}
              {deadline.daysDelayed > 0
                ? ` · ${deadline.daysDelayed} days delayed`
                : ""}
            </p>
          </div>
          <select
            className="field max-w-xs"
            value={site.siteStatus}
            onChange={(event) =>
              update(
                "siteStatus",
                event.target.value as SiteExecution["siteStatus"],
              )
            }
          >
            {siteStatuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Read label="Job Code" value={context.jobCode} />
          <Read
            label="Project / Brand"
            value={`${context.projectName} / ${context.brand}`}
          />
          <Read label="Project Type" value={context.projectType} />
          <Read label="Project Manager" value={context.projectManager} />
          <Read label="Location" value={site.location} />
          <Read label="Site Address" value={context.address} />
          <Read label="Client Contact" value={context.clientContact} />
          <Read
            label="Brand / Client Deadline"
            value={formatTaskDate(site.clientDeadline)}
          />
          <Read label="Work Description" value={site.workDescription} />
          <Read
            label="PO Reference"
            value={context.poReference || "Not available"}
          />
        </dl>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DateField
            label="Recce"
            value={site.recceDate}
            onChange={(v) => update("recceDate", v)}
          />
          <DateField
            label="Planned Start"
            value={site.plannedSiteStartDate}
            onChange={(v) => update("plannedSiteStartDate", v)}
          />
          <DateField
            label="Actual Start"
            value={site.actualSiteStartDate}
            onChange={(v) => update("actualSiteStartDate", v)}
          />
          <DateField
            label="Target Completion"
            value={site.targetSiteCompletionDate}
            onChange={(v) => update("targetSiteCompletionDate", v)}
          />
          <DateField
            label="Actual Completion"
            value={site.actualSiteCompletionDate}
            onChange={(v) => update("actualSiteCompletionDate", v)}
          />
        </div>
        <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
          Latest Remarks
          <textarea
            className="field mt-1 min-h-20"
            value={site.latestRemarks}
            onChange={(e) => update("latestRemarks", e.target.value)}
          />
        </label>
      </section>

      <section className="panel p-5">
        <p className="eyebrow">Execution Scope</p>
        <h2 className="mt-1 font-bold">Work Packages</h2>
        <div className="mt-4 space-y-3">
          {site.workPackages.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">{item.category}</p>
                <select
                  className="field w-auto"
                  value={item.status}
                  onChange={(e) =>
                    updatePackage(item.id, {
                      status: e.target.value as typeof item.status,
                    })
                  }
                >
                  {siteWorkStatuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {item.responsiblePartyType}: {item.responsiblePartyName} · Due{" "}
                {formatTaskDate(item.dueDate)}
              </p>
              {item.delayReason && (
                <p className="mt-1 text-sm font-semibold text-amber-800">
                  Delay: {item.delayReason}
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Responsible Type"
                  value={item.responsiblePartyType}
                  options={responsiblePartyTypes}
                  onChange={(value) =>
                    updatePackage(item.id, {
                      responsiblePartyType:
                        value as typeof item.responsiblePartyType,
                    })
                  }
                />
                <label className="text-xs font-bold uppercase text-slate-500">
                  Responsible Party
                  <input
                    className="field mt-1"
                    value={item.responsiblePartyName}
                    onChange={(e) =>
                      updatePackage(item.id, {
                        responsiblePartyName: e.target.value,
                      })
                    }
                  />
                </label>
                <DateField
                  label="Planned Start"
                  value={item.plannedStartDate}
                  onChange={(value) =>
                    updatePackage(item.id, { plannedStartDate: value })
                  }
                />
                <DateField
                  label="Due Date"
                  value={item.dueDate}
                  onChange={(value) =>
                    updatePackage(item.id, { dueDate: value })
                  }
                />
                <DateField
                  label="Actual Start"
                  value={item.actualStartDate}
                  onChange={(value) =>
                    updatePackage(item.id, { actualStartDate: value })
                  }
                />
                <DateField
                  label="Actual Completion"
                  value={item.actualCompletionDate}
                  onChange={(value) =>
                    updatePackage(item.id, { actualCompletionDate: value })
                  }
                />
                <SelectField
                  label="Delay Reason"
                  value={item.delayReason}
                  options={["", ...siteDelayReasons]}
                  onChange={(value) =>
                    updatePackage(item.id, {
                      delayReason: value as typeof item.delayReason,
                    })
                  }
                />
                <label className="text-xs font-bold uppercase text-slate-500">
                  Notes
                  <input
                    className="field mt-1"
                    value={item.notes}
                    onChange={(e) =>
                      updatePackage(item.id, { notes: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={addPackage}
        >
          <select name="category" className="field" required>
            {workPackageCategories.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select name="partyType" className="field" required>
            {responsiblePartyTypes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            name="partyName"
            className="field"
            placeholder="Responsible party"
            required
          />
          <input name="dueDate" type="date" className="field" required />
          <button className="button button-secondary" type="submit">
            Add Work Package
          </button>
        </form>
      </section>

      <section className="panel p-5">
        <p className="eyebrow">Progress</p>
        <h2 className="mt-1 font-bold">Update Log</h2>
        <form onSubmit={addProgress} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="date" type="date" className="field" required />
          <input
            name="update"
            className="field"
            placeholder="Progress update"
            required
          />
          <input
            name="blocker"
            className="field"
            placeholder="Blocker or dependency"
          />
          <input
            name="nextAction"
            className="field"
            placeholder="Next action"
          />
          <button
            className="button button-secondary md:col-span-2"
            type="submit"
          >
            Add Update
          </button>
        </form>
        <div className="mt-4 space-y-3">
          {[...site.progressUpdates]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((item) => (
              <div key={item.id} className="border-l-2 border-blue-200 pl-4">
                <p className="text-xs font-bold text-slate-500">
                  {formatTaskDate(item.date)}
                </p>
                <p className="mt-1 text-sm font-semibold">{item.update}</p>
                {item.blockerOrDependency && (
                  <p className="text-sm text-amber-800">
                    Blocker: {item.blockerOrDependency}
                  </p>
                )}
                <p className="text-sm text-slate-600">
                  Next: {item.nextAction || "—"}
                </p>
              </div>
            ))}
        </div>
      </section>

      {productionRecords.length > 0 && (
        <section className="panel p-5">
          <p className="eyebrow">Fixture Installation</p>
          <h2 className="mt-1 font-bold">
            {installation.totalInstalled} / {installation.totalReceived}{" "}
            installed · {installation.installationPercentage}%
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Dispatched</th>
                  <th>Received at Site</th>
                  <th>Installed</th>
                  <th>Pending</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {installation.fixtures.map((item) => (
                  <tr key={item.fixtureId}>
                    <td className="font-semibold">{item.fixtureName}</td>
                    <td>{item.dispatchedQty}</td>
                    <td>
                      <input
                        className="field w-24"
                        type="number"
                        min="0"
                        max={item.dispatchedQty}
                        value={item.receivedAtSiteQty}
                        onChange={(e) =>
                          updateReceipt(item.fixtureId, {
                            receivedAtSiteQty: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="field w-24"
                        type="number"
                        min="0"
                        max={item.receivedAtSiteQty}
                        value={item.installedQty}
                        onChange={(e) =>
                          updateReceipt(item.fixtureId, {
                            installedQty: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>{item.pendingInstallationQty}</td>
                    <td>{item.installationPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section
          className={`panel p-5 ${rectification ? "border-amber-400 bg-amber-50" : ""}`}
        >
          <p className="eyebrow">Site QC</p>
          <h2 className="mt-1 font-bold">{site.qc.qcStatus}</h2>
          {rectification && (
            <p className="mt-2 text-sm font-bold text-amber-900">
              Rectification requires attention.
            </p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SelectField
              label="QC Status"
              value={site.qc.qcStatus}
              options={siteQCStatuses}
              onChange={(value) =>
                update("qc", {
                  ...site.qc,
                  qcStatus: value as typeof site.qc.qcStatus,
                })
              }
            />
            <DateField
              label="QC Date"
              value={site.qc.qcDate}
              onChange={(value) => update("qc", { ...site.qc, qcDate: value })}
            />
            <label className="text-xs font-bold uppercase text-slate-500 sm:col-span-2">
              Checklist / Photos Link
              <input
                className="field mt-1"
                value={site.qc.qcChecklistOrPhotosLink}
                onChange={(e) =>
                  update("qc", {
                    ...site.qc,
                    qcChecklistOrPhotosLink: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={site.qc.rectificationRequired}
                onChange={(e) =>
                  update("qc", {
                    ...site.qc,
                    rectificationRequired: e.target.checked,
                  })
                }
              />
              Rectification required
            </label>
            <label className="text-xs font-bold uppercase text-slate-500 sm:col-span-2">
              QC Notes
              <textarea
                className="field mt-1"
                value={site.qc.notes}
                onChange={(e) =>
                  update("qc", { ...site.qc, notes: e.target.value })
                }
              />
            </label>
            <label className="text-xs font-bold uppercase text-slate-500">
              QC Person
              <input
                className="field mt-1"
                value={site.qc.qcPerson}
                onChange={(e) =>
                  update("qc", { ...site.qc, qcPerson: e.target.value })
                }
              />
            </label>
            <label className="text-xs font-bold uppercase text-slate-500">
              Snag Count
              <input
                className="field mt-1"
                type="number"
                min="0"
                value={site.qc.snagCount}
                onChange={(e) =>
                  update("qc", {
                    ...site.qc,
                    snagCount: Number(e.target.value),
                  })
                }
              />
            </label>
            <DateField
              label="Rectification Due"
              value={site.qc.rectificationDueDate}
              onChange={(value) =>
                update("qc", { ...site.qc, rectificationDueDate: value })
              }
            />
            <DateField
              label="Rectification Completed"
              value={site.qc.rectificationCompletedDate}
              onChange={(value) =>
                update("qc", {
                  ...site.qc,
                  rectificationCompletedDate: value,
                  qcStatus: value ? "Pending" : site.qc.qcStatus,
                })
              }
            />
          </div>
        </section>
        <section
          className={`panel p-5 ${completed ? "border-emerald-300 bg-emerald-50" : ""}`}
        >
          <p className="eyebrow">Handover</p>
          <h2 className="mt-1 font-bold">{site.handover.handoverStatus}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Handover Status"
              value={site.handover.handoverStatus}
              options={handoverStatuses}
              onChange={(value) => {
                const handoverStatus =
                  value as typeof site.handover.handoverStatus;
                setSite({
                  ...site,
                  handover: { ...site.handover, handoverStatus },
                  siteStatus:
                    handoverStatus === "Handed Over"
                      ? "Handed Over"
                      : site.siteStatus,
                });
              }}
            />
            <DateField
              label="Handover Date"
              value={site.handover.handoverDate}
              onChange={(value) =>
                update("handover", { ...site.handover, handoverDate: value })
              }
            />
            <label className="text-xs font-bold uppercase text-slate-500 sm:col-span-2">
              Document Link
              <input
                className="field mt-1"
                value={site.handover.handoverDocumentLink}
                onChange={(e) =>
                  update("handover", {
                    ...site.handover,
                    handoverDocumentLink: e.target.value,
                  })
                }
              />
            </label>
            <label className="text-xs font-bold uppercase text-slate-500 sm:col-span-2">
              Notes
              <textarea
                className="field mt-1"
                value={site.handover.handoverNotes}
                onChange={(e) =>
                  update("handover", {
                    ...site.handover,
                    handoverNotes: e.target.value,
                  })
                }
              />
            </label>
          </div>
        </section>
      </div>
      <p className="text-xs text-slate-500">
        Prototype-only local changes are not persisted.
      </p>
    </div>
  );
}

function Read({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value || "—"}</dd>
    </div>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-bold uppercase text-slate-500">
      {label}
      <input
        className="field mt-1"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-bold uppercase text-slate-500">
      {label}
      <select
        className="field mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
