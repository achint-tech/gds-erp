import { describe, expect, it } from "vitest";
import { getAssignedAge, getTaskHealth } from "./task-timing";

const today = new Date(2026, 7, 27);

describe("task timing", () => {
  it("reports assigned age", () => {
    expect(getAssignedAge("2026-08-27", today)).toBe("Assigned today");
    expect(getAssignedAge("2026-08-23", today)).toBe("Assigned 4 days ago");
  });

  it("classifies incomplete due dates", () => {
    expect(getTaskHealth("In Progress", "2026-08-25", today).label).toBe(
      "Overdue by 2 days",
    );
    expect(getTaskHealth("In Progress", "2026-08-27", today).health).toBe(
      "Due Today",
    );
    expect(getTaskHealth("In Progress", "2026-08-29", today).health).toBe(
      "Due Soon",
    );
    expect(getTaskHealth("Blocked", "2026-09-03", today).health).toBe(
      "On Track",
    );
  });

  it("never marks a completed task overdue", () => {
    expect(getTaskHealth("Completed", "2026-08-20", today).health).toBe(
      "Completed",
    );
    expect(getTaskHealth("Closed", "2026-08-20", today).health).toBe(
      "Completed",
    );
  });
});
