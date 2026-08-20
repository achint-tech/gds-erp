import Link from "next/link";
import { notFound } from "next/navigation";
import { activeProjects, archivedProjects } from "@/lib/prototype-data";

const fields = [
  ["financialYear", "Financial Year"],
  ["jobCode", "GDS Job Code"],
  ["projectName", "Project Name"],
  ["brand", "Brand"],
  ["projectType", "Project Type"],
  ["projectLead", "Project Lead"],
  ["projectManager", "Project Manager"],
  ["status", "Project Status"],
  ["address", "Address and City"],
  ["sitePocName", "Site POC Name"],
  ["sitePocEmail", "Site POC Email"],
  ["sitePocPhone", "Site POC Phone"],
] as const;

export function generateStaticParams() {
  return [...activeProjects, ...archivedProjects].map(({ jobCode }) => ({
    jobCode,
  }));
}

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ jobCode: string }>;
}) {
  const { jobCode } = await params;
  const project = [...activeProjects, ...archivedProjects].find(
    (item) => item.jobCode === jobCode,
  );
  if (!project) notFound();
  return (
    <>
      <Link
        href="/projects/active"
        className="mb-6 inline-flex text-sm font-bold text-blue-800 hover:underline"
      >
        ← Back to Active Projects
      </Link>
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Project Overview / {project.jobCode}</p>
          <h1 className="page-title">{project.projectName}</h1>
          <p className="subtle mt-2 text-sm">
            Approved initial project information · Fictional prototype record
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900">
          {project.status}
        </span>
      </div>
      <section
        className="panel overflow-hidden"
        aria-labelledby="overview-heading"
      >
        <div className="border-b border-slate-200 px-5 py-4 lg:px-7">
          <h2 id="overview-heading" className="font-bold">
            Project overview
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Initial approved information only.
          </p>
        </div>
        <dl className="grid md:grid-cols-2">
          {fields.map(([key, label]) => (
            <div
              key={key}
              className={`border-b border-slate-100 px-5 py-5 lg:px-7 ${key === "address" ? "md:col-span-2" : "md:border-r"}`}
            >
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6">
                {project[key]}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
        <h2 className="text-sm font-bold text-slate-700">
          Detailed project progression
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The detailed project progression workflow will be designed next.
        </p>
      </section>
    </>
  );
}
