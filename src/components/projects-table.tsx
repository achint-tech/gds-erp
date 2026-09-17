"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterProjects, type ProjectListItem } from "@/lib/project-utils";

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
  projects: ProjectListItem[];
  archived?: boolean;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const brands = useMemo(
    () => [...new Set(projects.map((project) => project.brand))].sort(),
    [projects],
  );
  const types = useMemo(
    () => [...new Set(projects.map((project) => project.projectType))].sort(),
    [projects],
  );
  const leads = useMemo(
    () => [...new Set(projects.map((project) => project.projectLead))].sort(),
    [projects],
  );
  const managers = useMemo(
    () =>
      [...new Set(projects.map((project) => project.projectManager))].sort(),
    [projects],
  );
  const statuses = useMemo(
    () => [...new Set(projects.map((project) => project.status))].sort(),
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
            options={types}
            onChange={(value) => set("type", value)}
          />
          <Filter
            label="All leads"
            value={filters.lead}
            options={leads}
            onChange={(value) => set("lead", value)}
          />
          <Filter
            label="All PMs"
            value={filters.manager}
            options={managers}
            onChange={(value) => set("manager", value)}
          />
          <Filter
            label="All statuses"
            value={filters.status}
            options={statuses}
            onChange={(value) => set("status", value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500">
        <span>
          {results.length} {results.length === 1 ? "project" : "projects"}
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
                key={`${project.financialYear}-${project.routeKey ?? project.jobCode}`}
                className="hover:bg-blue-50/60"
              >
                <td className="px-4 py-4 font-bold text-slate-700">
                  <span>{project.jobCode}</span>
                  {project.source && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                      {project.source === "persistent" ? "Saved" : "Demo"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 font-semibold">
                  <Link
                    href={`/projects/${project.routeKey ?? project.jobCode}`}
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
                  {project.lifecycleState === "Draft" && (
                    <span className="ml-2 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                      Draft
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!results.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-14 text-center text-slate-500"
                >
                  No projects match these filters.
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
