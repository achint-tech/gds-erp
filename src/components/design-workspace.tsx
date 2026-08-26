"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  designTypes,
  taskPriorities,
  type DesignTask,
} from "@/lib/prototype-data";
import {
  canCompleteDesignTask,
  createNewDesignTask,
  createNextDesignVersion,
  isActiveDesignTask,
  sortDesignVersions,
} from "@/lib/design-task-utils";
import {
  formatTaskDate,
  getAssignedAge,
  getTaskHealth,
} from "@/lib/task-timing";

const prototypePeople = [
  "Prototype Designer A",
  "Prototype Designer B",
  "Anumeha",
  "Sachin",
  "Neeraj",
];

function browserDate() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function DesignWorkspace({
  jobCode,
  initialTasks = [],
}: {
  jobCode: string;
  initialTasks?: DesignTask[];
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [nextVersionFor, setNextVersionFor] = useState<string | null>(null);
  const orderedTasks = useMemo(() => sortDesignVersions(tasks), [tasks]);
  const active = tasks.filter(isActiveDesignTask);
  const overdue = active.filter(
    (task) => getTaskHealth(task.status, task.dueDate).health === "Overdue",
  ).length;
  const waiting = tasks.filter(
    (task) => task.clientResponseStatus === "Waiting Client",
  ).length;
  const approved = tasks.filter(
    (task) => task.clientResponseStatus === "Approved",
  ).length;

  function updateTask(id: string, update: Partial<DesignTask>) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...update } : task)),
    );
  }

  function completeTask(task: DesignTask) {
    const validation = canCompleteDesignTask(task);
    if (!validation.valid) {
      setMessages((current) => ({ ...current, [task.id]: validation.message }));
      return;
    }
    updateTask(task.id, { status: "Completed", completedDate: browserDate() });
    setMessages((current) => ({ ...current, [task.id]: "" }));
  }

  function saveDrawingLink(task: DesignTask) {
    const drawingLink = linkDrafts[task.id]?.trim() ?? "";
    if (!drawingLink) return;
    updateTask(task.id, { drawingLink });
    setMessages((current) => ({
      ...current,
      [task.id]: "Drawing link saved. You can now mark this task Completed.",
    }));
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setTasks((current) => [
      ...current,
      createNewDesignTask({
        id: `DES-${jobCode}-${Date.now()}`,
        projectJobCode: jobCode,
        designType: data.get("designType") as DesignTask["designType"],
        taskName: String(data.get("taskName")),
        assignedTo: String(data.get("assignedTo")),
        assignedBy: String(data.get("assignedBy")),
        assignedDate: String(data.get("assignedDate")),
        dueDate: String(data.get("dueDate")),
        priority: data.get("priority") as DesignTask["priority"],
        notes: String(data.get("notes")),
      }),
    ]);
    setShowForm(false);
  }

  function addNextVersion(
    event: FormEvent<HTMLFormElement>,
    previous: DesignTask,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setTasks((current) => [
      ...current,
      createNextDesignVersion(
        previous,
        String(data.get("assignedDate")),
        String(data.get("dueDate")),
        `DES-${jobCode}-${Date.now()}`,
      ),
    ]);
    setNextVersionFor(null);
  }

  return (
    <section className="space-y-5" aria-labelledby="design-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Design</p>
          <h2 id="design-heading" className="mt-1 text-xl font-bold">
            Design Versions
          </h2>
          <p className="subtle mt-1 text-sm">
            One task represents one version. Prototype changes are not
            persisted.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setShowForm((value) => !value)}
        >
          + Add Design Task
        </button>
      </div>
      <div className="panel grid grid-cols-2 overflow-hidden sm:grid-cols-4">
        <Metric label="Active" value={active.length} />
        <Metric label="Overdue Active" value={overdue} warning />
        <Metric label="Waiting Client" value={waiting} />
        <Metric label="Approved" value={approved} />
      </div>
      {showForm && <DesignTaskForm onSubmit={addTask} />}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[1450px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {[
                "Design Type",
                "Task",
                "Version",
                "Assigned To",
                "Assigned",
                "Due",
                "Task Status",
                "Client Response",
                "Completed",
                "Submitted",
                "Action",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedTasks.map((task) => {
              const timing = getTaskHealth(task.status, task.dueDate);
              const nextVersion = tasks.find(
                (candidate) => candidate.previousVersionTaskId === task.id,
              );
              return (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 align-top"
                >
                  <td className="px-4 py-4 font-semibold">{task.designType}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{task.taskName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.priority}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-bold">{task.version}</td>
                  <td className="px-4 py-4">{task.assignedTo}</td>
                  <td className="px-4 py-4">
                    {getAssignedAge(task.assignedDate)}
                  </td>
                  <td className="px-4 py-4">
                    <p>{formatTaskDate(task.dueDate)}</p>
                    {isActiveDesignTask(task) && (
                      <Badge tone={healthTone(timing.health)}>
                        {timing.label}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={responseTone(task.clientResponseStatus)}>
                      {task.clientResponseStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {formatTaskDate(task.completedDate)}
                  </td>
                  <td className="px-4 py-4">
                    {formatTaskDate(task.submittedDate)}
                  </td>
                  <td className="space-y-2 px-4 py-4">
                    {task.drawingLink ? (
                      <a
                        href={task.drawingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-bold text-blue-800 hover:underline"
                      >
                        Open Drawing ↗
                      </a>
                    ) : isActiveDesignTask(task) ? (
                      <div className="flex min-w-64 gap-2">
                        <input
                          aria-label={`Drawing link for ${task.taskName} ${task.version}`}
                          className="control min-h-9 py-1 text-xs"
                          type="url"
                          placeholder="Drawing link"
                          value={linkDrafts[task.id] ?? ""}
                          onChange={(event) =>
                            setLinkDrafts((current) => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="button button-quiet min-h-9 px-2 py-1 text-xs"
                          onClick={() => saveDrawingLink(task)}
                        >
                          Save
                        </button>
                      </div>
                    ) : null}
                    {isActiveDesignTask(task) && (
                      <button
                        type="button"
                        className="block font-bold text-blue-800 hover:underline"
                        onClick={() => completeTask(task)}
                      >
                        Mark Complete
                      </button>
                    )}
                    {task.status === "Completed" && (
                      <button
                        type="button"
                        className="block font-bold text-blue-800 hover:underline"
                        onClick={() =>
                          updateTask(task.id, {
                            status: "Closed",
                            submittedDate: browserDate(),
                            clientResponseStatus: "Waiting Client",
                          })
                        }
                      >
                        Submit to Client
                      </button>
                    )}
                    {task.status === "Closed" &&
                      task.clientResponseStatus === "Waiting Client" && (
                        <>
                          <button
                            type="button"
                            className="block font-bold text-blue-800 hover:underline"
                            onClick={() =>
                              updateTask(task.id, {
                                clientResponseStatus: "Approved",
                              })
                            }
                          >
                            Mark Approved
                          </button>
                          <button
                            type="button"
                            className="block font-bold text-blue-800 hover:underline"
                            onClick={() =>
                              updateTask(task.id, {
                                clientResponseStatus: "Revision Requested",
                              })
                            }
                          >
                            Revision Requested
                          </button>
                        </>
                      )}
                    {task.clientResponseStatus === "Revision Requested" &&
                      !nextVersion && (
                        <button
                          type="button"
                          className="block font-bold text-blue-800 hover:underline"
                          onClick={() => setNextVersionFor(task.id)}
                        >
                          Create Next Version
                        </button>
                      )}
                    {nextVersion && (
                      <p className="text-xs font-semibold text-slate-600">
                        Next version exists: {nextVersion.version}
                      </p>
                    )}
                    {messages[task.id] && (
                      <p
                        role="alert"
                        className={`max-w-64 text-xs ${messages[task.id].startsWith("Add") ? "text-red-700" : "text-emerald-700"}`}
                      >
                        {messages[task.id]}
                      </p>
                    )}
                    {nextVersionFor === task.id && (
                      <form
                        className="grid min-w-64 gap-2"
                        onSubmit={(event) => addNextVersion(event, task)}
                      >
                        <input
                          className="control min-h-9 py-1 text-xs"
                          aria-label="New assigned date"
                          name="assignedDate"
                          type="date"
                          required
                        />
                        <input
                          className="control min-h-9 py-1 text-xs"
                          aria-label="New due date"
                          name="dueDate"
                          type="date"
                          required
                        />
                        <button
                          className="button button-primary min-h-9 py-1 text-xs"
                          type="submit"
                        >
                          Create {task.designType} Next Version
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No Design Tasks have been added.
          </p>
        )}
      </div>
    </section>
  );
}

function DesignTaskForm({
  onSubmit,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="panel grid gap-4 p-5 md:grid-cols-2">
      <SelectField
        name="designType"
        label="Design Type"
        options={designTypes}
      />
      <InputField name="taskName" label="Task Name" required />
      <SelectField
        name="assignedTo"
        label="Assigned To"
        options={prototypePeople}
      />
      <SelectField
        name="assignedBy"
        label="Assigned By"
        options={prototypePeople}
      />
      <InputField
        name="assignedDate"
        label="Assigned Date"
        type="date"
        required
      />
      <InputField name="dueDate" label="Due Date" type="date" required />
      <SelectField name="priority" label="Priority" options={taskPriorities} />
      <label className="field md:col-span-2">
        <span>Notes</span>
        <textarea className="control min-h-24" name="notes" />
      </label>
      <div className="md:col-span-2">
        <p className="mb-3 text-xs text-slate-500">
          Starts as V1 · Not Started · Not Submitted. Drawing link is added
          before completion.
        </p>
        <button type="submit" className="button button-primary">
          Add Task
        </button>
      </div>
    </form>
  );
}

function InputField({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="control" name={name} type={type} required={required} />
    </label>
  );
}
function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="control" name={name}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="border-b border-r border-slate-100 px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold ${warning && value ? "text-red-700" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function Badge({ children, tone }: { children: string; tone: string }) {
  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}
    >
      {children}
    </span>
  );
}
function statusTone(status: DesignTask["status"]) {
  return status === "Closed"
    ? "bg-slate-200 text-slate-800"
    : status === "Completed"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-blue-50 text-blue-800";
}
function responseTone(status: DesignTask["clientResponseStatus"]) {
  return status === "Approved"
    ? "bg-emerald-50 text-emerald-800"
    : status === "Revision Requested"
      ? "bg-red-100 text-red-800"
      : status === "Waiting Client"
        ? "bg-amber-100 text-amber-900"
        : "bg-slate-100 text-slate-700";
}
function healthTone(health: ReturnType<typeof getTaskHealth>["health"]) {
  return health === "Overdue"
    ? "bg-red-100 text-red-800"
    : health === "Due Today" || health === "Due Soon"
      ? "bg-amber-100 text-amber-900"
      : "bg-slate-100 text-slate-700";
}
