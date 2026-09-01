import Link from "next/link";
import { activeProjects } from "@/lib/prototype-data";
import type { DispatchRecord, ProductionRecord } from "@/lib/production-data";
import {
  deriveQCStatus,
  getDispatchSummary,
  getProductionHealth,
  getProductionProgress,
} from "@/lib/production-utils";
import { formatTaskDate } from "@/lib/task-timing";

export function ProductionDashboard({
  records,
  dispatches,
}: {
  records: ProductionRecord[];
  dispatches: DispatchRecord[];
}) {
  const projects = [...new Set(records.map((record) => record.jobCode))].map(
    (jobCode) => ({
      jobCode,
      records: records.filter((record) => record.jobCode === jobCode),
    }),
  );
  return (
    <>
      <div>
        <p className="eyebrow">Department workspace</p>
        <h1 className="page-title">Production Dashboard</h1>
        <p className="subtle mt-2 text-sm">
          Project-level production health · Fictional local data only
        </p>
      </div>
      <section className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {[
                "Project",
                "Fixture Types",
                "Overall Qty Progress",
                "Nearest/Internal Deadline",
                "Production Health",
                "QC",
                "Delay",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(({ jobCode, records: projectRecords }) => {
              const project = activeProjects.find(
                (item) => item.jobCode === jobCode,
              );
              const required = projectRecords.reduce(
                (sum, record) => sum + record.requiredQty,
                0,
              );
              const completed = projectRecords.reduce(
                (sum, record) => sum + record.completedQty,
                0,
              );
              const nearest = [...projectRecords].sort((a, b) =>
                a.internalDeadline.localeCompare(b.internalDeadline),
              )[0];
              const overdue = projectRecords.filter(
                (record) => getProductionHealth(record).health === "Overdue",
              );
              const dueSoon = projectRecords.some(
                (record) => getProductionHealth(record).health === "Due Soon",
              );
              const health = overdue.length
                ? "Overdue"
                : projectRecords.every(
                      (record) =>
                        getProductionProgress(record).pendingQty === 0,
                    )
                  ? "Completed"
                  : dueSoon
                    ? "Due Soon"
                    : "On Track";
              const rework = projectRecords.filter(
                (record) => deriveQCStatus(record.qc) === "Rework Required",
              ).length;
              const dispatch = getDispatchSummary(
                projectRecords,
                dispatches.filter((record) => record.jobCode === jobCode),
              );
              return (
                <tr key={jobCode} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <Link
                      href={`/projects/${jobCode}?section=production`}
                      className="font-bold text-blue-800 hover:underline"
                    >
                      {jobCode} · {project?.projectName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{projectRecords.length}</td>
                  <td className="px-4 py-4">
                    {completed} / {required}
                  </td>
                  <td className="px-4 py-4">
                    {formatTaskDate(nearest.internalDeadline)}
                  </td>
                  <td
                    className={`px-4 py-4 font-bold ${health === "Overdue" ? "text-red-700" : ""}`}
                  >
                    {dispatch.dispatchStatus === "Not Ready"
                      ? health
                      : dispatch.dispatchStatus}
                  </td>
                  <td className="px-4 py-4">
                    {rework ? `${rework} Rework` : "No rework"}
                  </td>
                  <td className="px-4 py-4">
                    {overdue[0]
                      ? `${overdue[0].fixtureName}: ${overdue[0].delayReason || "Not recorded"}`
                      : "—"}
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
