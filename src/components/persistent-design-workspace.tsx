"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  approveDesignVersionAction,
  saveDesignTaskAction,
  saveDesignVersionAction,
  submitDesignVersionAction,
  type DesignActionResult,
} from "@/app/projects/design-actions";
import {
  designTaskStatuses,
  designTypes,
  designWaitingForOptions,
  type DesignTask,
  type DesignTaskStatus,
  type DesignVersion,
  type DesignWorkspaceData,
} from "@/server/design/design-domain";

export function PersistentDesignWorkspace({
  projectId,
  workspace,
  loadError,
}: {
  projectId: string;
  workspace: DesignWorkspaceData | null;
  loadError: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [taskForm, setTaskForm] = useState<DesignTask | "new" | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [versionForm, setVersionForm] = useState<{
    taskId: string;
    version?: DesignVersion;
  } | null>(null);

  if (loadError || !workspace) {
    return (
      <section className="panel mt-5 p-5" aria-labelledby="design-heading">
        <p className="eyebrow">Design</p>
        <h2 id="design-heading" className="mt-1 font-bold">
          Design workspace unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The Design migration may not have been applied yet. No project data
          was changed.
        </p>
      </section>
    );
  }

  function run(action: () => Promise<DesignActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.success ? success : result.error || "Save failed.");
      if (result.success) {
        setTaskForm(null);
        setVersionForm(null);
        router.refresh();
      }
    });
  }

  const versionsFor = (taskId: string) =>
    workspace.versions
      .filter((version) => version.designTaskId === taskId)
      .sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <section className="mt-5 space-y-4" aria-labelledby="design-heading">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Design</p>
          <h2 id="design-heading" className="mt-1 text-xl font-bold">
            Design Tasks &amp; Drawing History
          </h2>
          <p className="subtle mt-1 text-sm">
            Drawing files remain in Google Drive; ERP stores operational links
            and version history.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setTaskForm("new")}
          disabled={!workspace.assignees.length}
        >
          + Add Design Task
        </button>
      </div>

      <div className="panel grid grid-cols-2 overflow-hidden sm:grid-cols-4">
        <Metric label="Open Tasks" value={workspace.summary.openTasks} />
        <Metric label="Waiting" value={workspace.summary.waitingTasks} />
        <Metric label="Approved" value={workspace.summary.approvedTasks} />
        <Metric
          label="Overdue"
          value={workspace.summary.overdueTasks}
          warning
        />
      </div>

      {!workspace.assignees.length && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No active Design-eligible users are available. Initialize approved
          Design users after the migration is applied.
        </p>
      )}
      {message && (
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      )}

      {taskForm && (
        <TaskForm
          task={taskForm === "new" ? null : taskForm}
          assignees={workspace.assignees}
          pending={pending}
          onCancel={() => setTaskForm(null)}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            run(
              () =>
                saveDesignTaskAction(taskForm === "new" ? null : taskForm.id, {
                  projectId,
                  designType: String(form.get("designType")),
                  taskName: String(form.get("taskName")),
                  assignedToUserId: String(form.get("assignedToUserId")),
                  targetDate: String(form.get("targetDate")),
                  status: String(form.get("status")),
                  waitingFor: String(form.get("waitingFor")),
                  notes: String(form.get("notes")),
                }),
              taskForm === "new"
                ? "Design Task added."
                : "Design Task updated.",
            );
          }}
        />
      )}

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {[
                "Task",
                "Type",
                "Assigned To",
                "Target Date",
                "Status",
                "Current Version",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="border-b px-4 py-3 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspace.tasks.map((task) => {
              const versions = versionsFor(task.id);
              const current = versions[0];
              const expanded = expandedTaskId === task.id;
              return (
                <TaskRows
                  key={task.id}
                  task={task}
                  current={current}
                  versions={versions}
                  expanded={expanded}
                  pending={pending}
                  projectId={projectId}
                  onEdit={() => setTaskForm(task)}
                  onToggle={() => setExpandedTaskId(expanded ? null : task.id)}
                  onVersionForm={(version) =>
                    setVersionForm({ taskId: task.id, version })
                  }
                  run={run}
                />
              );
            })}
            {!workspace.tasks.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No Design Tasks have been added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {versionForm && (
        <VersionForm
          version={versionForm.version}
          pending={pending}
          onCancel={() => setVersionForm(null)}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            run(
              () =>
                saveDesignVersionAction(
                  versionForm.version?.id ?? null,
                  projectId,
                  {
                    designTaskId: versionForm.taskId,
                    drawingLink: String(form.get("drawingLink")),
                    revisionNotes: String(form.get("revisionNotes")),
                  },
                ),
              versionForm.version
                ? "Working version updated."
                : "New version added.",
            );
          }}
        />
      )}
    </section>
  );
}

function TaskRows({
  task,
  current,
  versions,
  expanded,
  pending,
  projectId,
  onEdit,
  onToggle,
  onVersionForm,
  run,
}: {
  task: DesignTask;
  current?: DesignVersion;
  versions: DesignVersion[];
  expanded: boolean;
  pending: boolean;
  projectId: string;
  onEdit: () => void;
  onToggle: () => void;
  onVersionForm: (version?: DesignVersion) => void;
  run: (action: () => Promise<DesignActionResult>, success: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-slate-100 align-top">
        <td className="px-4 py-4 font-semibold">{task.taskName}</td>
        <td className="px-4 py-4">{task.designType}</td>
        <td className="px-4 py-4">{task.assignedTo}</td>
        <td className="px-4 py-4">{task.targetDate}</td>
        <td className="px-4 py-4">
          {task.status}
          {task.waitingFor && (
            <span className="mt-1 block text-xs text-slate-500">
              {task.waitingFor}
            </span>
          )}
        </td>
        <td className="px-4 py-4 font-bold">
          {current ? `V${current.versionNumber} · ${current.status}` : "—"}
        </td>
        <td className="space-x-3 px-4 py-4">
          <button
            className="font-bold text-blue-800"
            type="button"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="font-bold text-blue-800"
            type="button"
            onClick={onToggle}
          >
            {expanded ? "Hide History" : "Drawing History"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-slate-50/60">
          <td colSpan={7} className="px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold">Drawing History</h3>
              <button
                className="button button-secondary min-h-9 py-1 text-xs"
                type="button"
                onClick={() => onVersionForm()}
              >
                + New Version
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center"
                >
                  <p className="text-sm">
                    <strong>V{version.versionNumber}</strong> · {version.status}
                    {version.submittedDate ? ` · ${version.submittedDate}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs font-bold">
                    <a
                      href={version.drawingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-800"
                    >
                      View Drawing ↗
                    </a>
                    {version.status === "Working" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onVersionForm(version)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () =>
                                submitDesignVersionAction(
                                  version.id,
                                  task.id,
                                  projectId,
                                  new Date().toISOString().slice(0, 10),
                                ),
                              "Version submitted.",
                            )
                          }
                        >
                          Submit
                        </button>
                      </>
                    )}
                    {version.status === "Submitted" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              approveDesignVersionAction(
                                version.id,
                                task.id,
                                projectId,
                              ),
                            "Version approved.",
                          )
                        }
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!versions.length && (
                <p className="text-sm text-slate-500">No drawing versions.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function TaskForm({
  task,
  assignees,
  pending,
  onCancel,
  onSubmit,
}: {
  task: DesignTask | null;
  assignees: DesignWorkspaceData["assignees"];
  pending: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [status, setStatus] = useState(task?.status ?? "Not Started");
  return (
    <form className="panel grid gap-4 p-5 md:grid-cols-2" onSubmit={onSubmit}>
      <Field label="Task Name">
        <input
          className="control"
          name="taskName"
          defaultValue={task?.taskName}
          required
        />
      </Field>
      <Field label="Design Type">
        <Select
          name="designType"
          value={task?.designType}
          options={designTypes}
        />
      </Field>
      <Field label="Assigned To">
        <Select
          name="assignedToUserId"
          value={task?.assignedToUserId}
          options={assignees.map(
            ({ id, displayName }) => [id, displayName] as const,
          )}
        />
      </Field>
      <Field label="Target Date">
        <input
          className="control"
          name="targetDate"
          type="date"
          defaultValue={task?.targetDate}
          required
        />
      </Field>
      <Field label="Status">
        <Select
          name="status"
          value={status}
          options={designTaskStatuses}
          onChange={(value) => setStatus(value as DesignTaskStatus)}
        />
      </Field>
      {status === "Waiting" && (
        <Field label="Waiting For">
          <Select
            name="waitingFor"
            value={task?.waitingFor ?? ""}
            options={designWaitingForOptions}
          />
        </Field>
      )}
      <Field label="Notes" wide>
        <textarea
          className="control min-h-24"
          name="notes"
          defaultValue={task?.notes ?? ""}
        />
      </Field>
      <div className="flex gap-2 md:col-span-2">
        <button className="button button-primary" disabled={pending}>
          Save
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function VersionForm({
  version,
  pending,
  onCancel,
  onSubmit,
}: {
  version?: DesignVersion;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="panel grid gap-4 p-5 md:grid-cols-2" onSubmit={onSubmit}>
      <h3 className="font-bold md:col-span-2">
        {version ? `Edit V${version.versionNumber}` : "New Drawing Version"}
      </h3>
      <Field label="Drawing / Drive Link" wide>
        <input
          className="control"
          name="drawingLink"
          type="url"
          defaultValue={version?.drawingLink}
          required
        />
      </Field>
      <Field label="Revision Notes" wide>
        <textarea
          className="control min-h-20"
          name="revisionNotes"
          defaultValue={version?.revisionNotes ?? ""}
        />
      </Field>
      <div className="flex gap-2 md:col-span-2">
        <button className="button button-primary" disabled={pending}>
          Save
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-bold uppercase text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value?: string;
  options: readonly (string | readonly [string, string])[];
  onChange?: (value: string) => void;
}) {
  return (
    <select
      className="control"
      name={name}
      defaultValue={onChange ? undefined : value}
      value={onChange ? value : undefined}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      required
    >
      <option value="">Select</option>
      {options.map((option) => {
        const pair = typeof option === "string" ? [option, option] : option;
        return (
          <option key={pair[0]} value={pair[0]}>
            {pair[1]}
          </option>
        );
      })}
    </select>
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
    <div className="border-b border-r border-slate-100 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${warning && value ? "text-amber-700" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
