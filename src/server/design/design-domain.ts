export const DESIGN_ELIGIBILITY_CAPABILITY = "designer";

export const designTypes = [
  "2D",
  "3D",
  "MEP",
  "Fixture Drawing",
  "Other",
] as const;
export const designTaskStatuses = [
  "Not Started",
  "In Progress",
  "Waiting",
  "Approved",
  "Closed",
] as const;
export const designWaitingForOptions = [
  "Client Feedback",
  "Site Measurement",
  "Inputs",
  "Other",
] as const;
export const designVersionStatuses = [
  "Working",
  "Submitted",
  "Superseded",
  "Approved",
] as const;

export type DesignType = (typeof designTypes)[number];
export type DesignTaskStatus = (typeof designTaskStatuses)[number];
export type DesignWaitingFor = (typeof designWaitingForOptions)[number];
export type DesignVersionStatus = (typeof designVersionStatuses)[number];

export type DesignAssignee = { id: string; displayName: string };
export type DesignTask = {
  id: string;
  projectId: string;
  designType: DesignType;
  taskName: string;
  assignedToUserId: string;
  assignedTo: string;
  targetDate: string;
  status: DesignTaskStatus;
  waitingFor: DesignWaitingFor | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type DesignVersion = {
  id: string;
  designTaskId: string;
  versionNumber: number;
  drawingLink: string;
  submittedDate: string | null;
  status: DesignVersionStatus;
  revisionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type SaveDesignTaskInput = {
  projectId: string;
  designType: DesignType;
  taskName: string;
  assignedToUserId: string;
  targetDate: string;
  status: DesignTaskStatus;
  waitingFor?: DesignWaitingFor | null;
  notes?: string | null;
};
export type NewDesignVersionInput = {
  designTaskId: string;
  drawingLink: string;
  revisionNotes?: string | null;
};
export type EditWorkingVersionInput = NewDesignVersionInput & { id: string };

export class DesignValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super("Design validation failed.");
    this.name = "DesignValidationError";
  }
}

function optional(value?: string | null) {
  return value?.trim() || null;
}

function validateDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isOverdueDesignTask(task: DesignTask, today: string) {
  return (
    task.targetDate < today &&
    task.status !== "Approved" &&
    task.status !== "Closed"
  );
}

export function getDesignSummary(
  tasks: DesignTask[],
  versions: DesignVersion[],
  today: string,
) {
  const latestByTask = new Map<string, DesignVersion>();
  const latestSubmittedByTask = new Map<string, DesignVersion>();
  for (const version of versions) {
    const latest = latestByTask.get(version.designTaskId);
    if (!latest || version.versionNumber > latest.versionNumber) {
      latestByTask.set(version.designTaskId, version);
    }
    if (version.status === "Submitted" || version.status === "Approved") {
      const submitted = latestSubmittedByTask.get(version.designTaskId);
      if (!submitted || version.versionNumber > submitted.versionNumber) {
        latestSubmittedByTask.set(version.designTaskId, version);
      }
    }
  }
  return {
    openTasks: tasks.filter(
      ({ status }) => status !== "Approved" && status !== "Closed",
    ).length,
    waitingTasks: tasks.filter(({ status }) => status === "Waiting").length,
    approvedTasks: tasks.filter(({ status }) => status === "Approved").length,
    overdueTasks: tasks.filter((task) => isOverdueDesignTask(task, today))
      .length,
    latestByTask,
    latestSubmittedByTask,
  };
}

export interface DesignStore {
  listEligibleAssignees(): Promise<DesignAssignee[]>;
  isEligibleAssignee(userId: string): Promise<boolean>;
  listTasks(projectId: string): Promise<DesignTask[]>;
  createTask(input: SaveDesignTaskInput): Promise<DesignTask>;
  updateTask(id: string, input: SaveDesignTaskInput): Promise<DesignTask>;
  listVersions(projectId: string): Promise<DesignVersion[]>;
  createVersion(input: NewDesignVersionInput): Promise<DesignVersion>;
  updateWorkingVersion(input: EditWorkingVersionInput): Promise<DesignVersion>;
  submitVersion(
    id: string,
    designTaskId: string,
    submittedDate: string,
  ): Promise<DesignVersion>;
  approveVersion(id: string, designTaskId: string): Promise<DesignVersion>;
}

export function createDesignService(store: DesignStore) {
  const cleanTask = async (input: SaveDesignTaskInput) => {
    const fieldErrors: Record<string, string> = {};
    if (!input.taskName.trim()) fieldErrors.taskName = "Task name is required.";
    if (!validateDate(input.targetDate)) {
      fieldErrors.targetDate = "Target date is required.";
    }
    if (!(await store.isEligibleAssignee(input.assignedToUserId))) {
      fieldErrors.assignedToUserId = "Select an eligible Design assignee.";
    }
    if (input.status === "Waiting" && !input.waitingFor) {
      fieldErrors.waitingFor = "Select what this task is waiting for.";
    }
    if (Object.keys(fieldErrors).length)
      throw new DesignValidationError(fieldErrors);
    return {
      ...input,
      taskName: input.taskName.trim(),
      waitingFor: input.status === "Waiting" ? input.waitingFor! : null,
      notes: optional(input.notes),
    };
  };
  const cleanVersion = (input: NewDesignVersionInput) => {
    if (!input.drawingLink.trim()) {
      throw new DesignValidationError({
        drawingLink: "Drawing link is required.",
      });
    }
    return {
      ...input,
      drawingLink: input.drawingLink.trim(),
      revisionNotes: optional(input.revisionNotes),
    };
  };

  return {
    listEligibleAssignees: () => store.listEligibleAssignees(),
    async getWorkspace(projectId: string, today: string) {
      const [assignees, tasks, versions] = await Promise.all([
        store.listEligibleAssignees(),
        store.listTasks(projectId),
        store.listVersions(projectId),
      ]);
      return {
        assignees,
        tasks,
        versions,
        summary: getDesignSummary(tasks, versions, today),
      };
    },
    async addTask(input: SaveDesignTaskInput) {
      return store.createTask(await cleanTask(input));
    },
    async editTask(id: string, input: SaveDesignTaskInput) {
      return store.updateTask(id, await cleanTask(input));
    },
    addVersion(input: NewDesignVersionInput) {
      return store.createVersion(cleanVersion(input));
    },
    editWorkingVersion(input: EditWorkingVersionInput) {
      return store.updateWorkingVersion({
        ...cleanVersion(input),
        id: input.id,
      });
    },
    submitVersion(id: string, designTaskId: string, submittedDate: string) {
      if (!validateDate(submittedDate)) {
        throw new DesignValidationError({
          submittedDate: "Submitted date is required.",
        });
      }
      return store.submitVersion(id, designTaskId, submittedDate);
    },
    approveVersion(id: string, designTaskId: string) {
      return store.approveVersion(id, designTaskId);
    },
  };
}

export type DesignWorkspaceData = Awaited<
  ReturnType<ReturnType<typeof createDesignService>["getWorkspace"]>
>;
