import Link from "next/link";
import { notFound } from "next/navigation";
import { CostingQuotationWorkspace } from "@/components/costing-quotation-workspace";
import { DesignWorkspace } from "@/components/design-workspace";
import { ProjectWorkspaceSections } from "@/components/project-workspace-sections";
import { PurchaseWorkspace } from "@/components/purchase-workspace";
import { ProductionWorkspace } from "@/components/production-workspace";
import {
  activeProjects,
  archivedProjects,
  costingWorkspaceByJobCode,
  designTasksByJobCode,
  purchaseOrdersByJobCode,
} from "@/lib/prototype-data";
import { formatTaskDate } from "@/lib/task-timing";
import { purchaseRequests, urgentPurchases } from "@/lib/purchase-data";
import { productionRecords } from "@/lib/production-data";

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
  searchParams,
}: {
  params: Promise<{ jobCode: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { jobCode } = await params;
  const { section } = await searchParams;
  const project = [...activeProjects, ...archivedProjects].find(
    (item) => item.jobCode === jobCode,
  );
  if (!project) notFound();
  const costingData = costingWorkspaceByJobCode[project.jobCode];
  const designTasks = designTasksByJobCode[project.jobCode] ?? [];
  const purchaseOrder = purchaseOrdersByJobCode[project.jobCode];
  const projectPurchaseRequests = purchaseRequests.filter(
    (request) => request.projectJobCode === project.jobCode,
  );
  const projectUrgentPurchases = urgentPurchases.filter(
    (purchase) => purchase.projectJobCode === project.jobCode,
  );
  const projectProductionRecords = productionRecords.filter(
    (record) => record.jobCode === project.jobCode,
  );

  const overview = (
    <>
      <section
        id="project-overview"
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
      <section className="panel mt-5 p-5" aria-labelledby="po-summary-heading">
        <p className="eyebrow">PO Received</p>
        <h2 id="po-summary-heading" className="mt-1 font-bold">
          Purchase Order
        </h2>
        {purchaseOrder ? (
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  PO Number
                </dt>
                <dd className="mt-1 font-semibold">{purchaseOrder.poNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  PO Date
                </dt>
                <dd className="mt-1 font-semibold">
                  {formatTaskDate(purchaseOrder.poDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  PO Amount
                </dt>
                <dd className="mt-1 font-semibold">{purchaseOrder.poAmount}</dd>
              </div>
            </dl>
            <a
              className="button button-secondary"
              href={purchaseOrder.poDocumentLink}
              target="_blank"
              rel="noreferrer"
            >
              Open PO ↗
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No PO information has been added.
          </p>
        )}
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

  const costing = (
    <CostingQuotationWorkspace
      jobCode={project.jobCode}
      owner={project.projectManager}
      projectType={project.projectType}
      initialData={costingData}
    />
  );
  const design = (
    <DesignWorkspace jobCode={project.jobCode} initialTasks={designTasks} />
  );
  const purchase = (
    <PurchaseWorkspace
      jobCode={project.jobCode}
      initialRequests={projectPurchaseRequests}
      initialUrgent={projectUrgentPurchases}
    />
  );
  const production = <ProductionWorkspace records={projectProductionRecords} />;

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
      <ProjectWorkspaceSections
        overview={overview}
        costing={costing}
        design={design}
        purchase={purchase}
        production={production}
        costingSummary={costingData?.summary}
        designTasks={designTasks}
        purchaseRequests={projectPurchaseRequests}
        productionRecords={projectProductionRecords}
        initialSection={section}
      />
    </>
  );
}
