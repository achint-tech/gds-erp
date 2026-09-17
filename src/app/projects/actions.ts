"use server";

import { revalidatePath } from "next/cache";
import {
  approvedProjectStatuses,
  approvedProjectTypes,
  ProjectActivationError,
  type ProjectStatus,
  type ProjectType,
  type SaveProjectDraftInput,
} from "@/server/projects/project-domain";
import { projectCreationService } from "@/server/projects/project-service";

export type ProjectFormActionInput = {
  projectId?: string;
  createdByUserId: string;
  projectName: string;
  brand: string;
  projectType: string;
  leadUserId: string;
  projectManagerUserId: string;
  projectStatus: string;
  address: string;
  clientPocName: string;
  clientPocEmail: string;
  clientPocPhone: string;
  notes: string;
};

export type ProjectFormActionResult = {
  success: boolean;
  error?: string;
  missingFields?: string[];
  projectId?: string;
  jobCode?: string;
  lifecycleState?: string;
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function toServiceInput(input: ProjectFormActionInput): SaveProjectDraftInput {
  const projectType = approvedProjectTypes.includes(
    input.projectType as ProjectType,
  )
    ? (input.projectType as ProjectType)
    : null;
  const projectStatus = approvedProjectStatuses.includes(
    input.projectStatus as ProjectStatus,
  )
    ? (input.projectStatus as ProjectStatus)
    : undefined;

  return {
    projectId: input.projectId,
    createdByUserId: input.createdByUserId,
    projectName: optional(input.projectName),
    brand: optional(input.brand),
    projectType,
    leadUserId: optional(input.leadUserId),
    projectManagerUserId: optional(input.projectManagerUserId),
    projectStatus,
    siteAddress: optional(input.address),
    city: null,
    clientPocName: optional(input.clientPocName),
    clientPocEmail: optional(input.clientPocEmail),
    clientPocPhone: optional(input.clientPocPhone),
    notes: optional(input.notes),
  };
}

function safeFailure(error: unknown, operation: "save" | "activate") {
  if (error instanceof ProjectActivationError) {
    return {
      success: false,
      error: error.message,
      missingFields: error.missingFields,
    } satisfies ProjectFormActionResult;
  }

  const message = error instanceof Error ? error.message : "";
  const userSelectionError =
    message.includes("eligible active internal user") ||
    message.includes("Created By must be");

  return {
    success: false,
    error: userSelectionError
      ? message
      : `Unable to ${operation === "save" ? "save the Draft" : "activate the project"}. Please try again.`,
  } satisfies ProjectFormActionResult;
}

function revalidateProject(projectId: string) {
  revalidatePath("/projects/active");
  revalidatePath(`/projects/${projectId}`);
}

export async function saveProjectDraftAction(
  input: ProjectFormActionInput,
): Promise<ProjectFormActionResult> {
  try {
    const project = await projectCreationService.saveDraft(
      toServiceInput(input),
    );
    revalidateProject(project.id);
    return {
      success: true,
      projectId: project.id,
      jobCode: project.jobCode,
      lifecycleState: project.lifecycleState,
    };
  } catch (error) {
    return safeFailure(error, "save");
  }
}

export async function activateProjectAction(
  input: ProjectFormActionInput,
): Promise<ProjectFormActionResult> {
  let projectId = input.projectId;
  let jobCode: string | undefined;

  try {
    const saved = await projectCreationService.saveDraft(toServiceInput(input));
    projectId = saved.id;
    jobCode = saved.jobCode;
    const active = await projectCreationService.activateDraft(saved.id);
    revalidateProject(active.id);
    return {
      success: true,
      projectId: active.id,
      jobCode: active.jobCode,
      lifecycleState: active.lifecycleState,
    };
  } catch (error) {
    const failure = safeFailure(error, "activate");
    return { ...failure, projectId, jobCode };
  }
}
