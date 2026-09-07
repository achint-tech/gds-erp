"use client";

import { useState, type ReactNode } from "react";
import type { BillRecord } from "@/lib/billing-data";
import { formatBillAmount, getBillingSummary } from "@/lib/billing-utils";
import type { ProjectPayment } from "@/lib/payment-data";
import { getPaymentSummary } from "@/lib/payment-utils";
import { displayValue } from "@/lib/costing-utils";
import {
  getLatestDesignVersions,
  isActiveDesignTask,
} from "@/lib/design-task-utils";
import type { CostingSummary, DesignTask } from "@/lib/prototype-data";
import type { PurchaseRequest } from "@/lib/purchase-data";
import { getPurchaseHealth } from "@/lib/purchase-utils";
import { getTaskHealth } from "@/lib/task-timing";
import type { DispatchRecord, ProductionRecord } from "@/lib/production-data";
import {
  deriveQCStatus,
  getDispatchSummary,
  getProductionHealth,
} from "@/lib/production-utils";
import type { SiteExecution } from "@/lib/site-execution-data";
import {
  getBillingReadiness,
  getInstallationSummary,
  getSiteDeadlineHealth,
  requiresRectification,
} from "@/lib/site-execution-utils";

type SectionName =
  | "overview"
  | "costing"
  | "design"
  | "purchase"
  | "production"
  | "site"
  | "billing"
  | "payment";

export function ProjectWorkspaceSections({
  overview,
  costing,
  design,
  purchase,
  production,
  site,
  billing,
  payment,
  costingSummary,
  designTasks = [],
  purchaseRequests = [],
  productionRecords = [],
  dispatchRecords = [],
  siteExecution,
  bills = [],
  projectPayment = { paymentReceivedDate: "", amountReceived: 0 },
  initialSection,
}: {
  overview: ReactNode;
  costing: ReactNode;
  design: ReactNode;
  purchase: ReactNode;
  production: ReactNode;
  site: ReactNode;
  billing: ReactNode;
  payment: ReactNode;
  costingSummary?: CostingSummary;
  designTasks?: DesignTask[];
  purchaseRequests?: PurchaseRequest[];
  productionRecords?: ProductionRecord[];
  dispatchRecords?: DispatchRecord[];
  siteExecution?: SiteExecution;
  bills?: BillRecord[];
  projectPayment?: ProjectPayment;
  initialSection?: string;
}) {
  const validInitialSection: SectionName =
    initialSection === "production" ||
    initialSection === "site" ||
    initialSection === "billing" ||
    initialSection === "payment"
      ? initialSection
      : "overview";
  const [activeSection, setActiveSection] =
    useState<SectionName>(validInitialSection);
  return (
    <>
      <div
        className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200"
        role="tablist"
        aria-label="Project workspace sections"
      >
        <TabButton
          active={activeSection === "overview"}
          onClick={() => setActiveSection("overview")}
        >
          Project Overview
        </TabButton>
        <TabButton
          active={activeSection === "costing"}
          onClick={() => setActiveSection("costing")}
        >
          Costing &amp; Quotation
        </TabButton>
        <TabButton
          active={activeSection === "design"}
          onClick={() => setActiveSection("design")}
        >
          Design
        </TabButton>
        <TabButton
          active={activeSection === "purchase"}
          onClick={() => setActiveSection("purchase")}
        >
          Purchase
        </TabButton>
        <TabButton
          active={activeSection === "production"}
          onClick={() => setActiveSection("production")}
        >
          Production
        </TabButton>
        <TabButton
          active={activeSection === "site"}
          onClick={() => setActiveSection("site")}
        >
          Site Execution
        </TabButton>
        <TabButton
          active={activeSection === "billing"}
          onClick={() => setActiveSection("billing")}
        >
          Billing
        </TabButton>
        <TabButton
          active={activeSection === "payment"}
          onClick={() => setActiveSection("payment")}
        >
          Payment
        </TabButton>
      </div>
      {activeSection === "overview" ? (
        <div role="tabpanel" aria-label="Project Overview">
          {overview}
          <section
            className="panel mt-5 overflow-hidden"
            aria-labelledby="compact-costing-heading"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 id="compact-costing-heading" className="font-bold">
                  Costing Summary
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Compact commercial status for this project.
                </p>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setActiveSection("costing")}
              >
                View Costing &amp; Quotation
              </button>
            </div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-5">
              <SummaryItem
                label="Costing Status"
                value={costingSummary?.costingStatus}
              />
              <SummaryItem
                label="Final Internal Cost"
                value={costingSummary?.finalInternalCost}
              />
              <SummaryItem
                label="Current Quotation Amount"
                value={costingSummary?.currentQuotationAmount}
              />
              <SummaryItem
                label="Current Quotation Version"
                value={costingSummary?.currentQuotationVersion}
              />
              <SummaryItem
                label="Quotation Status"
                value={costingSummary?.quotationStatus}
              />
            </dl>
          </section>
          <DesignSummary
            tasks={designTasks}
            onView={() => setActiveSection("design")}
          />
          <PurchaseSummary
            requests={purchaseRequests}
            onView={() => setActiveSection("purchase")}
          />
          <ProductionSummary
            records={productionRecords}
            dispatches={dispatchRecords}
            onView={() => setActiveSection("production")}
          />
          <SiteSummary
            site={siteExecution}
            records={productionRecords}
            dispatches={dispatchRecords}
            bills={bills}
            payment={projectPayment}
            onView={() => setActiveSection("site")}
          />
        </div>
      ) : activeSection === "costing" ? (
        <div role="tabpanel" aria-label="Costing & Quotation">
          {costing}
        </div>
      ) : activeSection === "design" ? (
        <div role="tabpanel" aria-label="Design">
          {design}
        </div>
      ) : activeSection === "purchase" ? (
        <div role="tabpanel" aria-label="Purchase">
          {purchase}
        </div>
      ) : activeSection === "production" ? (
        <div role="tabpanel" aria-label="Production">
          {production}
        </div>
      ) : activeSection === "site" ? (
        <div role="tabpanel" aria-label="Site Execution">
          {site}
        </div>
      ) : activeSection === "billing" ? (
        <div role="tabpanel" aria-label="Billing">
          {billing}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Payment">
          {payment}
        </div>
      )}
    </>
  );
}

function SiteSummary({
  site,
  records,
  dispatches,
  bills,
  payment,
  onView,
}: {
  site?: SiteExecution;
  records: ProductionRecord[];
  dispatches: DispatchRecord[];
  bills: BillRecord[];
  payment: ProjectPayment;
  onView: () => void;
}) {
  if (!site) return null;
  const deadline = getSiteDeadlineHealth(site);
  const installation = getInstallationSummary(site, records, dispatches);
  const rectification = requiresRectification(site);
  const billingReadiness = getBillingReadiness(site);
  const billingSummary = getBillingSummary(bills);
  const paymentSummary = getPaymentSummary(bills, payment);
  return (
    <section className="panel mt-5 p-5" aria-labelledby="site-summary-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Site Execution</p>
          <h2 id="site-summary-heading" className="mt-1 font-bold">
            {site.siteStatus}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Target {formatSummaryDate(site.targetSiteCompletionDate)} ·{" "}
            {deadline.health}
            {deadline.daysDelayed ? ` by ${deadline.daysDelayed} days` : ""}
          </p>
          {records.length > 0 && (
            <p className="mt-1 text-sm text-slate-600">
              Installation: {installation.totalInstalled} /{" "}
              {installation.totalReceived} ·{" "}
              {installation.installationPercentage}%
            </p>
          )}
          <p
            className={`mt-1 text-sm ${rectification ? "font-bold text-amber-800" : "text-slate-600"}`}
          >
            QC: {site.qc.qcStatus} · Handover: {site.handover.handoverStatus}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Measurement: {site.measurementStatus} · {billingReadiness.status}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Total Billed: {formatBillAmount(billingSummary.totalBilled)} ·{" "}
            {billingSummary.billCount} Bills
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Amount Received: {formatBillAmount(paymentSummary.totalReceived)} ·{" "}
            Pending: {formatBillAmount(paymentSummary.pendingAmount)} ·{" "}
            {paymentSummary.paymentStatus}
          </p>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onView}
        >
          View Site Execution →
        </button>
      </div>
    </section>
  );
}

function formatSummaryDate(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
    : "—";
}

function ProductionSummary({
  records,
  dispatches,
  onView,
}: {
  records: ProductionRecord[];
  dispatches: DispatchRecord[];
  onView: () => void;
}) {
  const required = records.reduce((sum, record) => sum + record.requiredQty, 0);
  const completed = records.reduce(
    (sum, record) => sum + record.completedQty,
    0,
  );
  const overdue = records.filter(
    (record) => getProductionHealth(record).health === "Overdue",
  );
  const rework = records.filter(
    (record) => deriveQCStatus(record.qc) === "Rework Required",
  );
  const dispatch = getDispatchSummary(records, dispatches);
  return (
    <section
      className="panel mt-5 p-5"
      aria-labelledby="production-summary-heading"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Production</p>
          <h2 id="production-summary-heading" className="mt-1 font-bold">
            {records.length} Fixture Types
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {completed} / {required} Completed · {overdue.length} Overdue ·{" "}
            {rework.length} QC/Rework Warnings
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Dispatch: {dispatch.dispatchStatus} · {dispatch.totalDispatchedQty}{" "}
            / {dispatch.totalRequiredQty}
          </p>
          {overdue[0] && (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Critical: {overdue[0].fixtureName} —{" "}
              {getProductionHealth(overdue[0]).label}
            </p>
          )}
          {!overdue[0] && rework[0] && (
            <p className="mt-3 text-sm font-semibold text-amber-800">
              QC: {rework[0].fixtureName} — Rework Required
            </p>
          )}
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onView}
        >
          View Production →
        </button>
      </div>
    </section>
  );
}

function PurchaseSummary({
  requests,
  onView,
}: {
  requests: PurchaseRequest[];
  onView: () => void;
}) {
  const sourcing = requests.filter(
    (request) => request.status === "Sourcing",
  ).length;
  const approval = requests.filter(
    (request) => request.status === "Awaiting Approval",
  ).length;
  const delivery = requests.filter(
    (request) => request.status === "Awaiting Delivery",
  ).length;
  const received = requests.filter(
    (request) => request.status === "Received",
  ).length;
  const overdue = requests.filter((request) =>
    getPurchaseHealth(request).health.includes("Overdue"),
  );
  return (
    <section
      className="panel mt-5 p-5"
      aria-labelledby="purchase-summary-heading"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Purchase</p>
          <h2 id="purchase-summary-heading" className="mt-1 font-bold">
            {requests.length} Requests
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {sourcing} Sourcing · {approval} Awaiting Approval · {delivery}{" "}
            Awaiting Delivery · {overdue.length} Overdue · {received} Received
          </p>
          {overdue[0] && (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Critical: {overdue[0].requestTitle} —{" "}
              {getPurchaseHealth(overdue[0]).label}
            </p>
          )}
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onView}
        >
          View Purchase →
        </button>
      </div>
    </section>
  );
}

function DesignSummary({
  tasks,
  onView,
}: {
  tasks: DesignTask[];
  onView: () => void;
}) {
  const activeTasks = tasks.filter(isActiveDesignTask);
  const latestVersions = getLatestDesignVersions(tasks);
  const waiting = tasks.filter(
    (task) => task.clientResponseStatus === "Waiting Client",
  ).length;
  const approvedStreams = latestVersions.filter(
    (task) => task.clientResponseStatus === "Approved",
  ).length;
  const overdueTasks = activeTasks.filter(
    (task) => getTaskHealth(task.status, task.dueDate).health === "Overdue",
  );
  return (
    <section
      className="panel mt-5 p-5"
      aria-labelledby="design-summary-heading"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Design</p>
          <h2 id="design-summary-heading" className="mt-1 font-bold">
            {activeTasks.length} Active
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {overdueTasks.length} Overdue · {waiting} Waiting Client ·{" "}
            {approvedStreams} Approved Streams
          </p>
          {overdueTasks.length > 0 && (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Critical: {overdueTasks[0].taskName} {overdueTasks[0].version} —{" "}
              {
                getTaskHealth(overdueTasks[0].status, overdueTasks[0].dueDate)
                  .label
              }
              {overdueTasks.length > 1
                ? ` · ${overdueTasks.length - 1} more overdue`
                : ""}
            </p>
          )}
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onView}
        >
          View Design →
        </button>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${active ? "border-blue-700 font-bold text-blue-900" : "border-transparent font-semibold text-slate-600 hover:text-slate-950"}`}
    >
      {children}
    </button>
  );
}
function SummaryItem({ label, value = "" }: { label: string; value?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 lg:border-r">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-slate-800">
        {displayValue(value)}
      </dd>
    </div>
  );
}
