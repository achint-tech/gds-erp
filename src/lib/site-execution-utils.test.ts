import { describe, expect, it } from "vitest";
import type { SiteExecution } from "./site-execution-data";
import {
  getInstallationProgress,
  getBillingReadiness,
  getSiteDeadlineHealth,
  isHandoverComplete,
  isMeasurementComplete,
  requiresRectification,
} from "./site-execution-utils";

const site = {
  targetSiteCompletionDate: "2026-09-05",
  actualSiteCompletionDate: "",
  qc: { qcStatus: "Pending", rectificationRequired: false },
  handover: { handoverStatus: "Pending" },
  measurementStatus: "Pending",
} as SiteExecution;

describe("Site Execution derivations", () => {
  it("derives deadline health and days delayed", () => {
    expect(
      getSiteDeadlineHealth(site, new Date("2026-09-01T00:00:00")),
    ).toEqual({ health: "On Track", daysDelayed: 0 });
    expect(
      getSiteDeadlineHealth(site, new Date("2026-09-04T00:00:00")),
    ).toEqual({ health: "Due Soon", daysDelayed: 0 });
    expect(
      getSiteDeadlineHealth(site, new Date("2026-09-08T00:00:00")),
    ).toEqual({ health: "Overdue", daysDelayed: 3 });
    expect(
      getSiteDeadlineHealth(
        { ...site, actualSiteCompletionDate: "2026-09-04" },
        new Date("2026-09-08T00:00:00"),
      ),
    ).toEqual({ health: "Completed", daysDelayed: 0 });
  });

  it("derives pending installation and percentage", () => {
    expect(getInstallationProgress(10, 8)).toEqual({
      pendingInstallationQty: 2,
      installationPercentage: 80,
    });
  });

  it("surfaces rectification from either QC control", () => {
    expect(
      requiresRectification({
        ...site,
        qc: { ...site.qc, rectificationRequired: true },
      }),
    ).toBe(true);
    expect(
      requiresRectification({
        ...site,
        qc: { ...site.qc, qcStatus: "Rectification Required" },
      }),
    ).toBe(true);
  });

  it("derives handover completion", () => {
    expect(
      isHandoverComplete({
        ...site,
        handover: { ...site.handover, handoverStatus: "Handed Over" },
      }),
    ).toBe(true);
  });

  it("treats Done and Not Required measurements as complete", () => {
    expect(isMeasurementComplete({ measurementStatus: "Done" })).toBe(true);
    expect(isMeasurementComplete({ measurementStatus: "Not Required" })).toBe(
      true,
    );
    expect(isMeasurementComplete({ measurementStatus: "Pending" })).toBe(false);
  });

  it("derives Billing Ready only from completed handover and measurement", () => {
    expect(
      getBillingReadiness({
        handover: { ...site.handover, handoverStatus: "Handed Over" },
        measurementStatus: "Done",
      }),
    ).toEqual({ ready: true, status: "Billing Ready", reason: "" });
    expect(
      getBillingReadiness({
        handover: { ...site.handover, handoverStatus: "Handed Over" },
        measurementStatus: "Not Required",
      }).ready,
    ).toBe(true);
  });

  it("explains each Billing Not Ready condition", () => {
    expect(getBillingReadiness(site).reason).toBe(
      "Handover + Measurement Pending",
    );
    expect(
      getBillingReadiness({
        handover: { ...site.handover, handoverStatus: "Handed Over" },
        measurementStatus: "Pending",
      }).reason,
    ).toBe("Measurement Pending");
    expect(
      getBillingReadiness({
        handover: site.handover,
        measurementStatus: "Not Required",
      }).reason,
    ).toBe("Handover Pending");
  });
});
