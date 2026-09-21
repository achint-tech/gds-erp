"use server";

import { revalidatePath } from "next/cache";
import {
  DesignValidationError,
  designTaskStatuses,
  designTypes,
  designWaitingForOptions,
  type DesignTaskStatus,
  type DesignType,
  type DesignWaitingFor,
} from "@/server/design/design-domain";
import { designService } from "@/server/design/design-service";

export type DesignActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function requireOption<T extends string>(
  value: string,
  options: readonly T[],
  field: string,
) {
  if (!options.includes(value as T)) {
    throw new DesignValidationError({ [field]: "Select a valid option." });
  }
  return value as T;
}

function failure(error: unknown): DesignActionResult {
  if (error instanceof DesignValidationError) {
    return {
      success: false,
      error: "Complete the required Design fields.",
      fieldErrors: error.fieldErrors,
    };
  }
  return { success: false, error: "The Design change could not be saved." };
}

function refresh(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
}

export async function saveDesignTaskAction(
  id: string | null,
  input: {
    projectId: string;
    designType: string;
    taskName: string;
    assignedToUserId: string;
    targetDate: string;
    status: string;
    waitingFor: string;
    notes: string;
  },
): Promise<DesignActionResult> {
  try {
    const status = requireOption<DesignTaskStatus>(
      input.status,
      designTaskStatuses,
      "status",
    );
    const waitingFor = input.waitingFor
      ? requireOption<DesignWaitingFor>(
          input.waitingFor,
          designWaitingForOptions,
          "waitingFor",
        )
      : null;
    const serviceInput = {
      ...input,
      designType: requireOption<DesignType>(
        input.designType,
        designTypes,
        "designType",
      ),
      status,
      waitingFor,
    };
    if (id) await designService.editTask(id, serviceInput);
    else await designService.addTask(serviceInput);
    refresh(input.projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function saveDesignVersionAction(
  id: string | null,
  projectId: string,
  input: { designTaskId: string; drawingLink: string; revisionNotes: string },
): Promise<DesignActionResult> {
  try {
    if (id) await designService.editWorkingVersion({ id, ...input });
    else await designService.addVersion(input);
    refresh(projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function submitDesignVersionAction(
  id: string,
  designTaskId: string,
  projectId: string,
  submittedDate: string,
): Promise<DesignActionResult> {
  try {
    await designService.submitVersion(id, designTaskId, submittedDate);
    refresh(projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function approveDesignVersionAction(
  id: string,
  designTaskId: string,
  projectId: string,
): Promise<DesignActionResult> {
  try {
    await designService.approveVersion(id, designTaskId);
    refresh(projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}
