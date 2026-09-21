import Link from "next/link";
import { ClientPoWorkspace } from "@/components/client-po-workspace";
import { PersistentCostingWorkspace } from "@/components/persistent-costing-workspace";
import { PersistentDesignWorkspace } from "@/components/persistent-design-workspace";
import { PersistentPrintRequests } from "@/components/persistent-print-requests";
import {
  ProjectForm,
  type ProjectFormInitialValues,
} from "@/components/project-form";
import type {
  PersistedProjectView,
  ProjectFormOptions,
} from "@/server/projects/project-service";
import type { ClientPurchaseOrder } from "@/server/client-purchase-orders/client-po-domain";
import type { CostingQuotationWorkspaceData } from "@/server/costing-quotation/costing-domain";
import type { DesignWorkspaceData } from "@/server/design/design-domain";
import type { PrintRequestWorkspaceData } from "@/server/print-requests/print-request-domain";

const overviewFields = [
  ["financialYear", "Financial Year"],
  ["jobCode", "GDS Job Code"],
  ["projectName", "Project Name"],
  ["brand", "Brand"],
  ["projectType", "Project Type"],
  ["projectLead", "Project Lead"],
  ["projectManager", "Project Manager"],
  ["createdBy", "Created By"],
  ["projectStatus", "Project Status"],
  ["siteAddress", "Address + City"],
  ["clientPocName", "Client POC Name"],
  ["clientPocEmail", "POC Email"],
  ["clientPocPhone", "POC Phone"],
  ["notes", "Notes"],
] as const;

export function PersistedProjectWorkspace({
  project,
  options,
  purchaseOrders,
  purchaseOrdersLoadError,
  costingWorkspace,
  costingLoadError,
  designWorkspace,
  designLoadError,
  printWorkspace,
  printLoadError,
}: {
  project: PersistedProjectView;
  options: ProjectFormOptions | null;
  purchaseOrders: ClientPurchaseOrder[];
  purchaseOrdersLoadError: boolean;
  costingWorkspace: CostingQuotationWorkspaceData | null;
  costingLoadError: boolean;
  designWorkspace: DesignWorkspaceData | null;
  designLoadError: boolean;
  printWorkspace: PrintRequestWorkspaceData | null;
  printLoadError: boolean;
}) {
  const initialValues: ProjectFormInitialValues = {
    projectId: project.id,
    jobCode: project.jobCode,
    lifecycleState: project.lifecycleState,
    createdByUserId: project.createdByUserId,
    projectName: project.projectName ?? "",
    brand: project.brand ?? "",
    projectType: project.projectType ?? "",
    leadUserId: project.leadUserId ?? "",
    projectManagerUserId: project.projectManagerUserId ?? "",
    projectStatus: project.projectStatus,
    address: [project.siteAddress, project.city].filter(Boolean).join(", "),
    clientPocName: project.clientPocName ?? "",
    clientPocEmail: project.clientPocEmail ?? "",
    clientPocPhone: project.clientPocPhone ?? "",
    notes: project.notes ?? "",
  };

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
          <p className="eyebrow">Saved Project / {project.jobCode}</p>
          <h1 className="page-title">
            {project.projectName || "Untitled Draft"}
          </h1>
          <p className="subtle mt-2 text-sm">
            Database-backed core project information
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900">
          {project.lifecycleState} · {project.projectStatus}
        </span>
      </div>

      {project.lifecycleState === "Draft" ? (
        options ? (
          <ProjectForm {...options} initialValues={initialValues} />
        ) : (
          <section className="panel p-6" role="alert">
            <h2 className="font-bold text-red-900">
              Draft editing unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Internal users could not be loaded. The existing Draft was not
              changed.
            </p>
          </section>
        )
      ) : (
        <section
          className="panel overflow-hidden"
          aria-labelledby="overview-heading"
        >
          <div className="border-b border-slate-200 px-5 py-4 lg:px-7">
            <h2 id="overview-heading" className="font-bold">
              Project overview
            </h2>
          </div>
          <dl className="grid md:grid-cols-2">
            {overviewFields.map(([key, label]) => (
              <div
                key={key}
                className="border-b border-slate-100 px-5 py-5 lg:px-7"
              >
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold leading-6">
                  {project[key] || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <ClientPoWorkspace
        projectId={project.id}
        purchaseOrders={purchaseOrders}
        loadError={purchaseOrdersLoadError}
      />

      <PersistentCostingWorkspace
        projectId={project.id}
        workspace={costingWorkspace}
        loadError={costingLoadError}
      />

      <PersistentDesignWorkspace
        projectId={project.id}
        workspace={designWorkspace}
        loadError={designLoadError}
      />

      <PersistentPrintRequests
        projectId={project.id}
        workspace={printWorkspace}
        loadError={printLoadError}
      />

      <section className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
        <h2 className="text-sm font-bold text-slate-700">
          Workflow persistence is deferred
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Core project information, Client POs, Costing &amp; Quotation, and
          Design, and Print / Branding are database-backed. Purchase,
          Production, Site, Billing, Payment, and Store remain prototype-only
          and are not persisted for this project.
        </p>
      </section>
    </>
  );
}
