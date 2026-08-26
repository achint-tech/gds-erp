"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterProjects } from "@/lib/project-utils";
import {
  approvedProjectStatuses,
  approvedProjectTypes,
  projectLeads,
  approvedProjectManagers,
  type Project,
} from "@/lib/prototype-data";

const emptyFilters = {
  search: "",
  brand: "",
  lead: "",
  manager: "",
  type: "",
  status: "",
};

export function ProjectsTable({
  projects,
  archived = false,
}: {
  projects: Project[];
  archived?: boolean;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const brands = useMemo(
    () => [...new Set(projects.map((project) => project.brand))].sort(),
    [projects],
  );
  const results = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters],
  );
  const set = (name: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [name]: value }));

  return (
    <section className="panel overflow-hidden">
      {archived && (
        <div className="border-b border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-950">
          <strong>Prototype placeholder:</strong> records are illustrative only.
          No archive workflow rules are defined.
        </div>
      )}
      <div className="border-b border-slate-200 p-5">
        <div className="filter-grid">
          <label className="field">
            <span className="sr-only">
              Search by GDS Job Code or Project Name
            </span>
            <input
              className="control"
              type="search"
              placeholder="Search Job Code or Project Name…"
              value={filters.search}
              onChange={(event) => set("search", event.target.value)}
            />
          </label>
          <Filter
            label="All brands"
            value={filters.brand}
            options={brands}
            onChange={(value) => set("brand", value)}
          />
          <Filter
            label="All types"
            value={filters.type}
            options={approvedProjectTypes}
            onChange={(value) => set("type", value)}
          />
          <Filter
            label="All leads"
            value={filters.lead}
            options={projectLeads}
            onChange={(value) => set("lead", value)}
          />
          <Filter
            label="All PMs"
            value={filters.manager}
            options={approvedProjectManagers}
            onChange={(value) => set("manager", value)}
          />
          <Filter
            label="All statuses"
            value={filters.status}
            options={approvedProjectStatuses}
            onChange={(value) => set("status", value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500">
        <span>
          {results.length} fictional{" "}
          {results.length === 1 ? "project" : "projects"}
        </span>
        <button
          className="font-bold text-blue-800"
          type="button"
          onClick={() => setFilters(emptyFilters)}
        >
          Clear filters
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                "GDS Job Code",
                "Project Name",
                "Brand",
                "Project Type",
                "Project Lead",
                "Project Manager",
                "Project Status",
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((project) => (
              <tr
                key={`${project.financialYear}-${project.jobCode}`}
                className="hover:bg-blue-50/60"
              >
                <td className="px-4 py-4 font-bold text-slate-700">
                  {project.jobCode}
                </td>
                <td className="px-4 py-4 font-semibold">
                  <Link
                    href={`/projects/${project.jobCode}`}
                    className="text-blue-800 underline-offset-4 hover:underline"
                  >
                    {project.projectName}
                  </Link>
                </td>
                <td className="px-4 py-4">{project.brand}</td>
                <td className="px-4 py-4">{project.projectType}</td>
                <td className="px-4 py-4">{project.projectLead}</td>
                <td className="px-4 py-4">{project.projectManager}</td>
                <td className="px-4 py-4">
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {project.status}
                  </span>
                </td>
              </tr>
            ))}
            {!results.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-14 text-center text-slate-500"
                >
                  No fictional projects match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
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
      <span className="sr-only">{label}</span>
      <select
        className="control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
