import { describe, expect, it } from "vitest";
import type { DesignTask } from "./prototype-data";
import {
  canCompleteDesignTask,
  createNewDesignTask,
  createNextDesignVersion,
  incrementVersion,
  isActiveDesignTask,
} from "./design-task-utils";

const base: DesignTask = {
  id: "DES-1",
  projectJobCode: "GDS150",
  designType: "2D",
  taskName: "Fictional Layout",
  assignedTo: "Prototype Designer A",
  assignedBy: "Neeraj",
  assignedDate: "2026-08-20",
  dueDate: "2026-08-24",
  completedDate: "2026-08-23",
  submittedDate: "2026-08-24",
  status: "Closed",
  clientResponseStatus: "Revision Requested",
  priority: "Normal",
  drawingLink: "https://drive.google.com/",
  version: "V1",
  previousVersionTaskId: "",
  notes: "Fictional task.",
};

describe("Design version logic", () => {
  it("increments readable versions", () => {
    expect(incrementVersion("V1")).toBe("V2");
    expect(incrementVersion("V9")).toBe("V10");
  });

  it("distinguishes active from historical tasks", () => {
    expect(isActiveDesignTask({ ...base, status: "In Progress" })).toBe(true);
    expect(isActiveDesignTask(base)).toBe(false);
    expect(
      isActiveDesignTask({ ...base, clientResponseStatus: "Waiting Client" }),
    ).toBe(false);
  });

  it("creates a V1 in the approved default state", () => {
    const task = createNewDesignTask({
      ...base,
      id: "NEW",
      assignedDate: "2026-08-27",
      dueDate: "2026-08-30",
    });
    expect(task).toMatchObject({
      version: "V1",
      status: "Not Started",
      clientResponseStatus: "Not Submitted",
      completedDate: "",
      submittedDate: "",
      drawingLink: "",
    });
  });

  it("resets mutable version fields and links to the previous task", () => {
    const next = createNextDesignVersion(
      base,
      "2026-08-27",
      "2026-08-31",
      "DES-2",
    );
    expect(next).toMatchObject({
      version: "V2",
      previousVersionTaskId: "DES-1",
      status: "Not Started",
      clientResponseStatus: "Not Submitted",
      completedDate: "",
      submittedDate: "",
      drawingLink: "",
    });
  });

  it("requires a drawing link for completion", () => {
    expect(canCompleteDesignTask({ ...base, drawingLink: "" }).valid).toBe(
      false,
    );
    expect(canCompleteDesignTask(base).valid).toBe(true);
  });
});
