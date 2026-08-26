"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  approvedProjectStatuses,
  approvedProjectTypes,
  nextPrototypeJobCode,
  projectLeads,
  approvedProjectManagers,
} from "@/lib/prototype-data";
import {
  projectFieldNames,
  validatePrototypeProject,
  type ProjectFormValues,
} from "@/lib/project-utils";

const initialValues = Object.fromEntries(
  projectFieldNames.map((field) => [
    field,
    field === "jobCode" ? nextPrototypeJobCode : "",
  ]),
) as ProjectFormValues;

const textFields = [
  ["projectName", "Project Name", "Enter a fictional project name", "text"],
  ["brand", "Brand", "Enter a fictional brand", "text"],
  ["address", "Address and City", "Enter a fictional address and city", "text"],
  ["sitePocName", "Site POC Name", "Enter a fictional contact name", "text"],
  ["sitePocEmail", "Site POC Email", "name@example.invalid", "email"],
  ["sitePocPhone", "Site POC Phone", "+91 00000 00000", "tel"],
] as const;

export function ProjectForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const update = (field: keyof ProjectFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validatePrototypeProject(values);
    setErrors(nextErrors);
    setNotice(
      Object.keys(nextErrors).length
        ? "Complete all mandatory fields before activation."
        : "Activation validated locally. No project was stored.",
    );
  };
  const draft = () =>
    setNotice(
      "Draft simulated locally. In production, the generated code will be reserved when the first Draft is saved.",
    );

  return (
    <form onSubmit={submit} noValidate className="panel overflow-hidden">
      <div className="border-b border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-950">
        All fields are mandatory for activation. An incomplete project may still
        be saved as Draft.
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-2 lg:p-7">
        <div className="field">
          <label htmlFor="jobCode">
            GDS Job Code <Required />
          </label>
          <input
            id="jobCode"
            className="control cursor-not-allowed bg-slate-100 font-bold text-slate-700"
            value={values.jobCode}
            readOnly
            aria-readonly="true"
          />
          <span className="text-xs text-slate-500">
            Generated for FY 2026-27. Production will reserve this code when the
            first Draft is saved.
          </span>
        </div>
        {textFields.map(([name, label, placeholder, type]) => (
          <TextField
            key={name}
            name={name}
            label={label}
            placeholder={placeholder}
            type={type}
            value={values[name]}
            error={errors[name]}
            onChange={update}
            wide={name === "address"}
            note={
              name === "brand"
                ? "Text entry for this prototype; searchable/selectable later."
                : undefined
            }
          />
        ))}
        <SelectField
          name="projectType"
          label="Project Type"
          value={values.projectType}
          error={errors.projectType}
          options={approvedProjectTypes}
          onChange={update}
        />
        <SelectField
          name="projectLead"
          label="Project Lead"
          value={values.projectLead}
          error={errors.projectLead}
          options={projectLeads}
          onChange={update}
        />
        <SelectField
          name="projectManager"
          label="Project Manager"
          value={values.projectManager}
          error={errors.projectManager}
          options={approvedProjectManagers}
          onChange={update}
        />
        <SelectField
          name="status"
          label="Project Status"
          value={values.status}
          error={errors.status}
          options={approvedProjectStatuses}
          onChange={update}
        />
      </div>
      {notice && (
        <div
          role="status"
          className="mx-5 mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 lg:mx-7"
        >
          {notice}
        </div>
      )}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end lg:px-7">
        <Link href="/" className="button button-secondary">
          Cancel
        </Link>
        <button type="button" className="button button-quiet" onClick={draft}>
          Save as Draft
        </button>
        <button type="submit" className="button button-primary">
          Submit to Active Projects
        </button>
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
  placeholder,
  type,
  value,
  error,
  onChange,
  wide,
  note,
}: {
  name: keyof ProjectFormValues;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  error?: string;
  onChange: (name: keyof ProjectFormValues, value: string) => void;
  wide?: boolean;
  note?: string;
}) {
  return (
    <div className={`field ${wide ? "md:col-span-2" : ""}`}>
      <label htmlFor={name}>
        {label} <Required />
      </label>
      <input
        id={name}
        type={type}
        className={`control ${error ? "control-error" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {note && <span className="text-xs text-slate-500">{note}</span>}
      {error && (
        <span id={`${name}-error`} className="error">
          {error}
        </span>
      )}
    </div>
  );
}

function SelectField({
  name,
  label,
  value,
  error,
  options,
  onChange,
}: {
  name: keyof ProjectFormValues;
  label: string;
  value: string;
  error?: string;
  options: readonly string[];
  onChange: (name: keyof ProjectFormValues, value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label} <Required />
      </label>
      <select
        id={name}
        className={`control ${error ? "control-error" : ""}`}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={!!error}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
