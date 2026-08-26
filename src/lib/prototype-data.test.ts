import { describe, expect, it } from "vitest";
import {
  activeProjects,
  approvedProjectStatuses,
  costingWorkspaceByJobCode,
  designTasksByJobCode,
  purchaseOrdersByJobCode,
} from "./prototype-data";

describe("Fixtures prototype costing data", () => {
  it("keeps GDS150 limited to its internal fixture source", () => {
    const project = activeProjects.find((item) => item.jobCode === "GDS150");
    const workspace = costingWorkspaceByJobCode.GDS150;

    expect(project?.projectType).toBe("Fixtures");
    expect(workspace.summary.costingMethod).toBe("Internal Production");
    expect(workspace.sources).toHaveLength(1);
    expect(workspace.sources[0]).toMatchObject({
      sourceName: "GDS Factory",
      sourceType: "Internal Production",
      workCategories: ["Fixtures", "Metal Fixtures"],
    });
  });
});

describe("approved design and PO prototype data", () => {
  it("includes Quotation without removing existing statuses", () => {
    expect(approvedProjectStatuses).toContain("Quotation");
    expect(approvedProjectStatuses).toContain("Payment");
  });

  it("provides the compact PO and varied Design demonstrations", () => {
    expect(purchaseOrdersByJobCode.GDS150.poDocumentLink).toMatch(/^https:/);
    expect(
      designTasksByJobCode.GDS149.some(
        (task) =>
          task.version === "V1" &&
          task.clientResponseStatus === "Revision Requested",
      ),
    ).toBe(true);
    expect(
      designTasksByJobCode.GDS149.some((task) => task.status === "In Progress"),
    ).toBe(true);
    expect(
      designTasksByJobCode.GDS149.some(
        (task) =>
          task.version === "V2" && task.clientResponseStatus === "Approved",
      ),
    ).toBe(true);
    expect(designTasksByJobCode.GDS150.some((task) => task.drawingLink)).toBe(
      true,
    );
  });
});
