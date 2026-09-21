import { describe, expect, it } from "vitest";
import {
  createDesignService,
  DESIGN_ELIGIBILITY_CAPABILITY,
  getDesignSummary,
  type DesignStore,
  type DesignTask,
  type DesignVersion,
  type SaveDesignTaskInput,
} from "./design-domain";

const projectId = "project-1";
const eligibleId = "designer-1";
const baseTask: SaveDesignTaskInput = {
  projectId,
  designType: "3D",
  taskName: "Fictional Store Design",
  assignedToUserId: eligibleId,
  targetDate: "2026-09-25",
  status: "Not Started",
  notes: null,
};

class MemoryDesignStore implements DesignStore {
  tasks: DesignTask[] = [];
  versions: DesignVersion[] = [];
  eligibleIds = new Set([eligibleId]);
  project = { status: "PO Received", jobCode: "GDS999", nextJobNumber: 1000 };
  private locked = Promise.resolve();

  listEligibleAssignees() {
    return Promise.resolve([
      { id: eligibleId, displayName: "Eligible Designer" },
    ]);
  }
  isEligibleAssignee(id: string) {
    return Promise.resolve(this.eligibleIds.has(id));
  }
  listTasks(id: string) {
    return Promise.resolve(this.tasks.filter((task) => task.projectId === id));
  }
  createTask(input: SaveDesignTaskInput) {
    const now = new Date();
    const task: DesignTask = {
      ...input,
      id: `task-${this.tasks.length + 1}`,
      assignedTo: "Eligible Designer",
      waitingFor: input.waitingFor ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return Promise.resolve(task);
  }
  updateTask(id: string, input: SaveDesignTaskInput) {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index < 0) throw new Error("missing task");
    const task: DesignTask = {
      ...this.tasks[index],
      ...input,
      assignedTo: "Eligible Designer",
      waitingFor: input.waitingFor ?? null,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    };
    this.tasks[index] = task;
    return Promise.resolve(task);
  }
  listVersions(id: string) {
    const taskIds = new Set(
      this.tasks.filter((task) => task.projectId === id).map(({ id }) => id),
    );
    return Promise.resolve(
      this.versions.filter(({ designTaskId }) => taskIds.has(designTaskId)),
    );
  }
  createVersion(input: {
    designTaskId: string;
    drawingLink: string;
    revisionNotes?: string | null;
  }) {
    const operation = this.locked.then(() => {
      const current = this.versions.filter(
        ({ designTaskId }) => designTaskId === input.designTaskId,
      );
      for (const version of current) {
        if (version.status !== "Superseded") version.status = "Superseded";
      }
      const now = new Date();
      const version: DesignVersion = {
        id: `version-${this.versions.length + 1}`,
        designTaskId: input.designTaskId,
        versionNumber:
          Math.max(0, ...current.map(({ versionNumber }) => versionNumber)) + 1,
        drawingLink: input.drawingLink,
        submittedDate: null,
        status: "Working",
        revisionNotes: input.revisionNotes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.versions.push(version);
      return version;
    });
    this.locked = operation.then(() => undefined);
    return operation;
  }
  updateWorkingVersion(input: {
    id: string;
    designTaskId: string;
    drawingLink: string;
    revisionNotes?: string | null;
  }) {
    const version = this.versions.find(
      ({ id, designTaskId, status }) =>
        id === input.id &&
        designTaskId === input.designTaskId &&
        status === "Working",
    );
    if (!version) throw new Error("Only Working can be edited");
    version.drawingLink = input.drawingLink;
    version.revisionNotes = input.revisionNotes ?? null;
    return Promise.resolve(version);
  }
  submitVersion(id: string, designTaskId: string, submittedDate: string) {
    const version = this.versions.find(
      (item) =>
        item.id === id &&
        item.designTaskId === designTaskId &&
        item.status === "Working",
    );
    if (!version) throw new Error("Only Working can be submitted");
    version.status = "Submitted";
    version.submittedDate = submittedDate;
    return Promise.resolve(version);
  }
  approveVersion(id: string, designTaskId: string) {
    const version = this.versions.find(
      (item) =>
        item.id === id &&
        item.designTaskId === designTaskId &&
        item.status === "Submitted",
    );
    if (!version) throw new Error("Only Submitted can be approved");
    for (const item of this.versions) {
      if (item.designTaskId === designTaskId && item.status === "Approved") {
        item.status = "Superseded";
      }
    }
    version.status = "Approved";
    const task = this.tasks.find(({ id }) => id === designTaskId)!;
    task.status = "Approved";
    task.waitingFor = null;
    return Promise.resolve(version);
  }
}

async function setup() {
  const store = new MemoryDesignStore();
  const service = createDesignService(store);
  const task = await service.addTask(baseTask);
  return { store, service, task };
}

describe("persisted Design workflow", () => {
  it("uses capability-based eligibility rather than named designers", () => {
    expect(DESIGN_ELIGIBILITY_CAPABILITY).toBe("designer");
    expect(JSON.stringify(baseTask)).not.toMatch(/Mouin|Azad/);
  });

  it("allows multiple Design Tasks per project", async () => {
    const { store, service } = await setup();
    await service.addTask({ ...baseTask, taskName: "Second Design" });
    expect(store.tasks).toHaveLength(2);
  });

  it("rejects an assignee without Design eligibility", async () => {
    const { service } = await setup();
    await expect(
      service.addTask({ ...baseTask, assignedToUserId: "other-user" }),
    ).rejects.toMatchObject({
      fieldErrors: { assignedToUserId: "Select an eligible Design assignee." },
    });
  });

  it("supports Waiting For and clears it outside Waiting", async () => {
    const { service, task } = await setup();
    const waiting = await service.editTask(task.id, {
      ...baseTask,
      status: "Waiting",
      waitingFor: "Client Feedback",
    });
    expect(waiting.waitingFor).toBe("Client Feedback");
    const active = await service.editTask(task.id, {
      ...baseTask,
      status: "In Progress",
      waitingFor: "Inputs",
    });
    expect(active.waitingFor).toBeNull();
  });

  it("requires Waiting For when status is Waiting", async () => {
    const { service, task } = await setup();
    await expect(
      service.editTask(task.id, { ...baseTask, status: "Waiting" }),
    ).rejects.toMatchObject({
      fieldErrors: { waitingFor: expect.any(String) },
    });
  });

  it("derives overdue only for tasks not Approved or Closed", async () => {
    const { store, service } = await setup();
    await service.addTask({
      ...baseTask,
      taskName: "Approved",
      status: "Approved",
    });
    const summary = getDesignSummary(store.tasks, [], "2026-09-26");
    expect(summary.overdueTasks).toBe(1);
    expect(summary.openTasks).toBe(1);
  });

  it("allocates V1, V2, V3 per task and preserves history", async () => {
    const { store, service, task } = await setup();
    await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v1",
    });
    await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v2",
    });
    await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v3",
    });
    expect(store.versions.map(({ versionNumber }) => versionNumber)).toEqual([
      1, 2, 3,
    ]);
    expect(store.versions.map(({ status }) => status)).toEqual([
      "Superseded",
      "Superseded",
      "Working",
    ]);
  });

  it("numbers versions independently per task", async () => {
    const { service, task } = await setup();
    const second = await service.addTask({ ...baseTask, taskName: "Second" });
    const firstV1 = await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/1",
    });
    const secondV1 = await service.addVersion({
      designTaskId: second.id,
      drawingLink: "https://example.com/2",
    });
    expect([firstV1.versionNumber, secondV1.versionNumber]).toEqual([1, 1]);
  });

  it("serializes concurrent version creation", async () => {
    const { service, task } = await setup();
    const versions = await Promise.all([
      service.addVersion({
        designTaskId: task.id,
        drawingLink: "https://example.com/a",
      }),
      service.addVersion({
        designTaskId: task.id,
        drawingLink: "https://example.com/b",
      }),
    ]);
    expect(
      new Set(versions.map(({ versionNumber }) => versionNumber)).size,
    ).toBe(2);
  });

  it("edits Working versions but preserves Submitted versions", async () => {
    const { service, task } = await setup();
    const version = await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/a",
    });
    await service.editWorkingVersion({
      ...version,
      drawingLink: "https://example.com/b",
    });
    await service.submitVersion(version.id, task.id, "2026-09-24");
    expect(() =>
      service.editWorkingVersion({
        ...version,
        drawingLink: "https://example.com/c",
      }),
    ).toThrow();
    expect(version.drawingLink).toBe("https://example.com/b");
  });

  it("approves one version, updates the task, and supersedes prior approval", async () => {
    const { store, service, task } = await setup();
    const first = await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v1",
    });
    await service.submitVersion(first.id, task.id, "2026-09-23");
    await service.approveVersion(first.id, task.id);
    const second = await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v2",
    });
    expect(first.status).toBe("Superseded");
    await service.submitVersion(second.id, task.id, "2026-09-24");
    await service.approveVersion(second.id, task.id);
    expect(
      store.versions.filter(({ status }) => status === "Approved"),
    ).toHaveLength(1);
    expect(store.tasks[0].status).toBe("Approved");
  });

  it("does not modify project status, Job Code, or FY sequence", async () => {
    const { store, service, task } = await setup();
    const before = { ...store.project };
    await service.addVersion({
      designTaskId: task.id,
      drawingLink: "https://example.com/v1",
    });
    expect(store.project).toEqual(before);
  });
});
