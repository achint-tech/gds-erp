import type { DispatchRecord, ProductionRecord } from "./production-data";
import { getFixtureDispatchedQty } from "./production-utils";
import type { SiteExecution } from "./site-execution-data";

const DAY_MS = 86_400_000;
function day(value: string | Date) {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getSiteDeadlineHealth(
  site: Pick<
    SiteExecution,
    "targetSiteCompletionDate" | "actualSiteCompletionDate"
  >,
  today = new Date(),
) {
  if (site.actualSiteCompletionDate)
    return { health: "Completed" as const, daysDelayed: 0 };
  const remaining = Math.round(
    (day(site.targetSiteCompletionDate).getTime() - day(today).getTime()) /
      DAY_MS,
  );
  if (remaining < 0)
    return { health: "Overdue" as const, daysDelayed: Math.abs(remaining) };
  if (remaining <= 2) return { health: "Due Soon" as const, daysDelayed: 0 };
  return { health: "On Track" as const, daysDelayed: 0 };
}

export function getInstallationProgress(
  receivedAtSiteQty: number,
  installedQty: number,
) {
  const received = Math.max(0, receivedAtSiteQty);
  const installed = Math.min(received, Math.max(0, installedQty));
  return {
    pendingInstallationQty: received - installed,
    installationPercentage:
      received === 0 ? 0 : Math.round((installed / received) * 100),
  };
}

export function getInstallationSummary(
  site: SiteExecution,
  records: ProductionRecord[],
  dispatches: DispatchRecord[],
) {
  const fixtures = records.map((record) => {
    const receipt = site.fixtureReceipts.find(
      (item) => item.fixtureId === record.id,
    );
    const receivedAtSiteQty = receipt?.receivedAtSiteQty ?? 0;
    const installedQty = receipt?.installedQty ?? 0;
    return {
      fixtureId: record.id,
      fixtureName: record.fixtureName,
      dispatchedQty: getFixtureDispatchedQty(record.id, dispatches),
      receivedAtSiteQty,
      installedQty,
      ...getInstallationProgress(receivedAtSiteQty, installedQty),
    };
  });
  const totalReceived = fixtures.reduce(
    (sum, item) => sum + item.receivedAtSiteQty,
    0,
  );
  const totalInstalled = fixtures.reduce(
    (sum, item) => sum + item.installedQty,
    0,
  );
  return {
    fixtures,
    totalReceived,
    totalInstalled,
    pendingInstallationQty: Math.max(0, totalReceived - totalInstalled),
    installationPercentage:
      totalReceived === 0
        ? 0
        : Math.round((totalInstalled / totalReceived) * 100),
  };
}

export function requiresRectification(site: Pick<SiteExecution, "qc">) {
  return (
    site.qc.rectificationRequired ||
    site.qc.qcStatus === "Rectification Required"
  );
}

export function isHandoverComplete(site: Pick<SiteExecution, "handover">) {
  return site.handover.handoverStatus === "Handed Over";
}

export function isMeasurementComplete(
  site: Pick<SiteExecution, "measurementStatus">,
) {
  return (
    site.measurementStatus === "Done" ||
    site.measurementStatus === "Not Required"
  );
}

export function getBillingReadiness(
  site?: Pick<SiteExecution, "handover" | "measurementStatus">,
) {
  if (!site)
    return {
      ready: false as const,
      status: "Billing Not Ready" as const,
      reason: "Handover + Measurement Pending",
    };
  const handoverComplete = isHandoverComplete(site);
  const measurementComplete = isMeasurementComplete(site);
  if (handoverComplete && measurementComplete)
    return {
      ready: true as const,
      status: "Billing Ready" as const,
      reason: "",
    };
  const reason =
    !handoverComplete && !measurementComplete
      ? "Handover + Measurement Pending"
      : !handoverComplete
        ? "Handover Pending"
        : "Measurement Pending";
  return {
    ready: false as const,
    status: "Billing Not Ready" as const,
    reason,
  };
}
