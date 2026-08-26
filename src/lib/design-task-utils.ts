import type { DesignTask } from "./prototype-data";

export function isActiveDesignTask(task: DesignTask) {
  return task.status === "Not Started" || task.status === "In Progress";
}

export function canCompleteDesignTask(task: DesignTask) {
  return task.drawingLink.trim()
    ? { valid: true as const, message: "" }
    : {
        valid: false as const,
        message:
          "Add a Drawing / Google Drive Link before completing this task.",
      };
}

export function incrementVersion(version: string) {
  const match = /^V(\d+)$/i.exec(version.trim());
  return `V${match ? Number(match[1]) + 1 : 1}`;
}

export function createNewDesignTask(
  input: Pick<
    DesignTask,
    | "id"
    | "projectJobCode"
    | "designType"
    | "taskName"
    | "assignedTo"
    | "assignedBy"
    | "assignedDate"
    | "dueDate"
    | "priority"
    | "notes"
  >,
): DesignTask {
  return {
    ...input,
    completedDate: "",
    submittedDate: "",
    status: "Not Started",
    clientResponseStatus: "Not Submitted",
    drawingLink: "",
    version: "V1",
    previousVersionTaskId: "",
  };
}

export function createNextDesignVersion(
  previous: DesignTask,
  assignedDate: string,
  dueDate: string,
  id: string,
): DesignTask {
  return {
    ...previous,
    id,
    assignedDate,
    dueDate,
    completedDate: "",
    submittedDate: "",
    status: "Not Started",
    clientResponseStatus: "Not Submitted",
    drawingLink: "",
    version: incrementVersion(previous.version),
    previousVersionTaskId: previous.id,
  };
}

export function sortDesignVersions(tasks: DesignTask[]) {
  return [...tasks].sort((a, b) => {
    const stream = `${a.designType}|${a.taskName}`.localeCompare(
      `${b.designType}|${b.taskName}`,
    );
    return stream || Number(a.version.slice(1)) - Number(b.version.slice(1));
  });
}

export function getLatestDesignVersions(tasks: DesignTask[]) {
  const latest = new Map<string, DesignTask>();
  for (const task of sortDesignVersions(tasks)) {
    latest.set(`${task.designType}|${task.taskName}`, task);
  }
  return [...latest.values()];
}
