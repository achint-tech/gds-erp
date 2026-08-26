"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { activeProjects } from "@/lib/prototype-data";
import {
  purchasePurposes,
  purchaseRequiredAtOptions,
  purchasePriorities,
  purchaseRequestStatuses,
  type PurchaseRequest,
} from "@/lib/purchase-data";
import { getPurchaseHealth } from "@/lib/purchase-utils";
import { formatTaskDate } from "@/lib/task-timing";

export function PurchaseDashboard({
  requests,
}: {
  requests: PurchaseRequest[];
}) {
  const [filters, setFilters] = useState({
    project: "",
    pm: "",
    purpose: "",
    requiredAt: "",
    priority: "",
    status: "",
  });
  const rows = useMemo(
    () =>
      requests.filter((request) => {
        const project = activeProjects.find(
          (item) => item.jobCode === request.projectJobCode,
        );
        return (
          (!filters.project || request.projectJobCode === filters.project) &&
          (!filters.pm || project?.projectManager === filters.pm) &&
          (!filters.purpose || request.purpose === filters.purpose) &&
          (!filters.requiredAt || request.requiredAt === filters.requiredAt) &&
          (!filters.priority || request.priority === filters.priority) &&
          (!filters.status || request.status === filters.status)
        );
      }),
    [filters, requests],
  );
  const update = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const delayed = requests.filter((request) =>
    getPurchaseHealth(request).health.includes("Overdue"),
  ).length;
  const metrics = [
    ["New Requests", "Request Raised"],
    ["Urgent", "Urgent"],
    ["Sourcing", "Sourcing"],
    ["Awaiting Approval", "Awaiting Approval"],
    ["PO Issued", "PO Issued"],
    ["Awaiting Delivery", "Awaiting Delivery"],
    ["Delayed", "Delayed"],
    ["Replacement", "Replacement Pending"],
  ] as const;
  return (
    <>
      <div>
        <p className="eyebrow">Department workspace</p>
        <h1 className="page-title">Purchase Dashboard</h1>
        <p className="subtle mt-2 text-sm">
          Cross-project material and product procurement · Fictional local data
          only
        </p>
      </div>
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {metrics.map(([label, status]) => (
          <div key={label} className="panel p-4">
            <p className="text-xs font-bold uppercase text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-xl font-bold">
              {status === "Urgent"
                ? requests.filter((request) => request.priority === "Urgent")
                    .length
                : status === "Delayed"
                  ? delayed
                  : requests.filter((request) => request.status === status)
                      .length}
            </p>
          </div>
        ))}
      </section>
      <section className="panel mt-5 grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
        <Filter
          label="Project"
          value={filters.project}
          options={activeProjects.map((project) => project.jobCode)}
          onChange={(value) => update("project", value)}
        />
        <Filter
          label="PM"
          value={filters.pm}
          options={[
            ...new Set(activeProjects.map((project) => project.projectManager)),
          ]}
          onChange={(value) => update("pm", value)}
        />
        <Filter
          label="Purpose"
          value={filters.purpose}
          options={purchasePurposes}
          onChange={(value) => update("purpose", value)}
        />
        <Filter
          label="Required At"
          value={filters.requiredAt}
          options={purchaseRequiredAtOptions}
          onChange={(value) => update("requiredAt", value)}
        />
        <Filter
          label="Priority"
          value={filters.priority}
          options={purchasePriorities}
          onChange={(value) => update("priority", value)}
        />
        <Filter
          label="Status"
          value={filters.status}
          options={purchaseRequestStatuses}
          onChange={(value) => update("status", value)}
        />
      </section>
      <section className="panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {[
                "PR",
                "Project",
                "Request",
                "Purpose",
                "PM",
                "Required By",
                "Status",
                "Health",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((request) => {
              const project = activeProjects.find(
                (item) => item.jobCode === request.projectJobCode,
              );
              return (
                <tr key={request.id} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-bold">{request.id}</td>
                  <td className="px-4 py-4">
                    <Link
                      className="font-bold text-blue-800 hover:underline"
                      href={`/projects/${request.projectJobCode}`}
                    >
                      {request.projectJobCode}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{request.requestTitle}</td>
                  <td className="px-4 py-4">{request.purpose}</td>
                  <td className="px-4 py-4">{project?.projectManager}</td>
                  <td className="px-4 py-4">
                    {formatTaskDate(request.requiredByDate)}
                  </td>
                  <td className="px-4 py-4">{request.status}</td>
                  <td className="px-4 py-4 font-semibold">
                    {getPurchaseHealth(request).label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
function Filter({
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
    <label className="field">
      <span>{label}</span>
      <select
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
