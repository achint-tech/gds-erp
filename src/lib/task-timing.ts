const DAY_MS = 86_400_000;

function dateOnly(value: string | Date) {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date) {
  return Math.round(
    (dateOnly(to).getTime() - dateOnly(from).getTime()) / DAY_MS,
  );
}

export type TaskHealth =
  "Completed" | "Overdue" | "Due Today" | "Due Soon" | "On Track";

export function getTaskHealth(
  status: string,
  dueDate: string,
  today = new Date(),
): { health: TaskHealth; label: string; daysUntilDue: number } {
  const daysUntilDue = daysBetween(today, new Date(`${dueDate}T00:00:00`));

  if (status === "Completed" || status === "Closed") {
    return { health: "Completed", label: "Completed", daysUntilDue };
  }
  if (daysUntilDue < 0) {
    const count = Math.abs(daysUntilDue);
    return {
      health: "Overdue",
      label: `Overdue by ${count} ${count === 1 ? "day" : "days"}`,
      daysUntilDue,
    };
  }
  if (daysUntilDue === 0) {
    return { health: "Due Today", label: "Due Today", daysUntilDue };
  }
  if (daysUntilDue <= 2) {
    return { health: "Due Soon", label: "Due Soon", daysUntilDue };
  }
  return { health: "On Track", label: "On Track", daysUntilDue };
}

export function getAssignedAge(assignedDate: string, today = new Date()) {
  const days = Math.max(
    0,
    daysBetween(new Date(`${assignedDate}T00:00:00`), today),
  );
  if (days === 0) return "Assigned today";
  return `Assigned ${days} ${days === 1 ? "day" : "days"} ago`;
}

export function formatTaskDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
