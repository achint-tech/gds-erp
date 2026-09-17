"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  activateProjectAction,
  saveProjectDraftAction,
  type ProjectFormActionInput,
} from "@/app/projects/actions";
import {
  activationFieldLabels,
  approvedProjectStatuses,
  approvedProjectTypes,
} from "@/server/projects/project-domain";

export type ProjectFormUserOption = {
  id: string;
  displayName: string;
};

export type ProjectFormInitialValues = ProjectFormActionInput & {
  jobCode: string;
  lifecycleState: string;
};

const blankValues: ProjectFormInitialValues = {
  projectId: undefined,
  jobCode: "",
  lifecycleState: "Draft",
  createdByUserId: "",
  projectName: "",
  brand: "",
  projectType: "",
  leadUserId: "",
  projectManagerUserId: "",
  projectStatus: "Quotation",
  address: "",
  clientPocName: "",
  clientPocEmail: "",
  clientPocPhone: "",
  notes: "",
};

const activationToFormField: Record<string, keyof ProjectFormActionInput> = {
  jobCode: "projectName",
  projectName: "projectName",
  brand: "brand",
  projectType: "projectType",
  leadUserId: "leadUserId",
  projectManagerUserId: "projectManagerUserId",
  projectStatus: "projectStatus",
};

export function ProjectForm({
  leads,
  projectManagers,
  creators,
  initialValues,
}: {
  leads: ProjectFormUserOption[];
  projectManagers: ProjectFormUserOption[];
  creators: ProjectFormUserOption[];
  initialValues?: ProjectFormInitialValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues ?? blankValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (field: keyof ProjectFormActionInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
    setIsError(false);
  };

  const runAction = (activate: boolean) => {
    setErrors({});
    setNotice("");
    setIsError(false);
    startTransition(async () => {
      const action = activate ? activateProjectAction : saveProjectDraftAction;
      const result = await action(values);

      if (!result.success) {
        const nextErrors = Object.fromEntries(
          (result.missingFields ?? []).map((field) => [
            activationToFormField[field] ?? field,
            `${activationFieldLabels[field as keyof typeof activationFieldLabels] ?? field} is required for activation`,
          ]),
        );
        setErrors(nextErrors);
        setNotice(result.error ?? "The project could not be saved.");
        setIsError(true);
        if (result.projectId && result.jobCode) {
          setValues((current) => ({
            ...current,
            projectId: result.projectId,
            jobCode: result.jobCode ?? current.jobCode,
          }));
          router.replace(`/projects/${result.projectId}?edit=1`);
        }
        return;
      }

      const nextValues = {
        ...values,
        projectId: result.projectId,
        jobCode: result.jobCode ?? values.jobCode,
        lifecycleState: result.lifecycleState ?? values.lifecycleState,
      };
      setValues(nextValues);
      setNotice(
        activate
          ? `${result.jobCode} is now Active.`
          : `Draft saved as ${result.jobCode}.`,
      );
      setIsError(false);
      if (result.projectId) {
        router.replace(
          activate
            ? `/projects/${result.projectId}`
            : `/projects/${result.projectId}?edit=1`,
        );
        router.refresh();
      }
    });
  };

  const editable = values.lifecycleState === "Draft";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        runAction(true);
      }}
      noValidate
      className="panel overflow-hidden"
    >
      <div className="border-b border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-950">
        Drafts may be incomplete. Fields marked * are required only for
        activation.
      </div>
      <fieldset disabled={!editable || isPending}>
        <div className="grid gap-5 p-5 md:grid-cols-2 lg:p-7">
          <div className="field">
            <label htmlFor="jobCode">GDS Job Code</label>
            <input
              id="jobCode"
              className="control cursor-not-allowed bg-slate-100 font-bold text-slate-700"
              value={values.jobCode || "Assigned on Save Draft"}
              readOnly
              aria-readonly="true"
            />
            <span className="text-xs text-slate-500">
              Reserved by the database after the first successful Draft save.
            </span>
          </div>
          <SelectField
            name="createdByUserId"
            label="Created By"
            value={values.createdByUserId}
            options={creators}
            onChange={update}
            required
            disabled={Boolean(values.projectId)}
            note="Temporary identity selection until authentication is implemented."
          />
          <TextField
            name="projectName"
            label="Project Name"
            value={values.projectName}
            error={errors.projectName}
            onChange={update}
            required
          />
          <TextField
            name="brand"
            label="Brand"
            value={values.brand}
            error={errors.brand}
            onChange={update}
            required
          />
          <SelectField
            name="projectType"
            label="Project Type"
            value={values.projectType}
            error={errors.projectType}
            options={approvedProjectTypes.map((value) => ({
              id: value,
              displayName: value,
            }))}
            onChange={update}
            required
          />
          <SelectField
            name="leadUserId"
            label="Project Lead"
            value={values.leadUserId}
            error={errors.leadUserId}
            options={leads}
            onChange={update}
            required
          />
          <SelectField
            name="projectManagerUserId"
            label="Project Manager"
            value={values.projectManagerUserId}
            error={errors.projectManagerUserId}
            options={projectManagers}
            onChange={update}
            required
          />
          <SelectField
            name="projectStatus"
            label="Project Status"
            value={values.projectStatus}
            error={errors.projectStatus}
            options={approvedProjectStatuses.map((value) => ({
              id: value,
              displayName: value,
            }))}
            onChange={update}
            required
          />
          <TextField
            name="clientPocName"
            label="Client POC Name"
            value={values.clientPocName}
            onChange={update}
          />
          <TextField
            name="clientPocEmail"
            label="POC Email"
            type="email"
            value={values.clientPocEmail}
            onChange={update}
          />
          <TextField
            name="clientPocPhone"
            label="POC Phone"
            type="tel"
            value={values.clientPocPhone}
            onChange={update}
          />
          <TextField
            name="address"
            label="Address + City"
            value={values.address}
            onChange={update}
            wide
          />
          <label className="field md:col-span-2" htmlFor="notes">
            <span>Notes</span>
            <textarea
              id="notes"
              className="control min-h-24"
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>
        </div>
      </fieldset>
      {notice && (
        <div
          role={isError ? "alert" : "status"}
          className={`mx-5 mb-5 rounded-lg px-4 py-3 text-sm lg:mx-7 ${isError ? "bg-red-50 text-red-900" : "bg-blue-50 text-blue-900"}`}
        >
          {notice}
        </div>
      )}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end lg:px-7">
        <Link href="/projects/active" className="button button-secondary">
          Cancel
        </Link>
        {editable && (
          <>
            <button
              type="button"
              className="button button-quiet"
              disabled={isPending}
              onClick={() => runAction(false)}
            >
              {isPending ? "Saving…" : "Save as Draft"}
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Submit to Active Projects"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function Required() {
  return (
    <span className="text-red-700" aria-hidden>
      *
    </span>
  );
}

function TextField({
  name,
  label,
  type = "text",
  value,
  error,
  onChange,
  wide,
  required,
}: {
  name: keyof ProjectFormActionInput;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (name: keyof ProjectFormActionInput, value: string) => void;
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`field ${wide ? "md:col-span-2" : ""}`} htmlFor={name}>
      <span>
        {label} {required && <Required />}
      </span>
      <input
        id={name}
        type={type}
        className={`control ${error ? "control-error" : ""}`}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <span className="error">{error}</span>}
    </label>
  );
}

function SelectField({
  name,
  label,
  value,
  error,
  options,
  onChange,
  required,
  disabled,
  note,
}: {
  name: keyof ProjectFormActionInput;
  label: string;
  value: string;
  error?: string;
  options: readonly ProjectFormUserOption[];
  onChange: (name: keyof ProjectFormActionInput, value: string) => void;
  required?: boolean;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <label className="field" htmlFor={name}>
      <span>
        {label} {required && <Required />}
      </span>
      <select
        id={name}
        className={`control ${error ? "control-error" : ""}`}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.displayName}
          </option>
        ))}
      </select>
      {note && <span className="text-xs text-slate-500">{note}</span>}
      {error && <span className="error">{error}</span>}
    </label>
  );
}
