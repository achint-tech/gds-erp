"use server";

import { revalidatePath } from "next/cache";
import {
  CostingValidationError,
  costingEntryStatuses,
  costingSources,
  costingWorkflowStatuses,
  costingWorkCategories,
  quotationStatuses,
  type CostingEntryStatus,
  type CostingSource,
  type CostingWorkflowStatus,
  type CostingWorkCategory,
  type CurrentQuotationStatus,
} from "@/server/costing-quotation/costing-domain";
import { costingQuotationService } from "@/server/costing-quotation/costing-service";

export type CostingActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function failure(error: unknown): CostingActionResult {
  if (error instanceof CostingValidationError) {
    return {
      success: false,
      error: "Complete the required fields.",
      fieldErrors: error.fieldErrors,
    };
  }
  return {
    success: false,
    error:
      "The Costing & Quotation change could not be saved. Please try again.",
  };
}

function requireOption<T extends string>(
  value: string,
  options: readonly T[],
  field: string,
) {
  if (!options.includes(value as T)) {
    throw new CostingValidationError({ [field]: "Select a valid option." });
  }
  return value as T;
}

function refresh(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
}

export async function saveCostingRequirementAction(input: {
  projectId: string;
  requirementReceivedDate: string;
  requirementBoqLink: string;
  scopeNotes: string;
  costingStatus: string;
}): Promise<CostingActionResult> {
  try {
    await costingQuotationService.saveRequirement({
      ...input,
      costingStatus: requireOption<CostingWorkflowStatus>(
        input.costingStatus,
        costingWorkflowStatuses,
        "costingStatus",
      ),
    });
    refresh(input.projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function saveCostingEntryAction(
  id: string | null,
  input: {
    projectId: string;
    workCategory: string;
    costingSource: string;
    vendorParty: string;
    costAmount: string;
    costingLink: string;
    status: string;
    notes: string;
  },
): Promise<CostingActionResult> {
  try {
    const status = requireOption<CostingEntryStatus>(
      input.status,
      costingEntryStatuses.filter((value) => value !== "Cancelled"),
      "status",
    ) as Exclude<CostingEntryStatus, "Cancelled">;
    const serviceInput = {
      ...input,
      workCategory: requireOption<CostingWorkCategory>(
        input.workCategory,
        costingWorkCategories,
        "workCategory",
      ),
      costingSource: requireOption<CostingSource>(
        input.costingSource,
        costingSources,
        "costingSource",
      ),
      status,
    };
    if (id) await costingQuotationService.editEntry(id, serviceInput);
    else await costingQuotationService.addEntry(serviceInput);
    refresh(input.projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function cancelCostingEntryAction(
  id: string,
  projectId: string,
): Promise<CostingActionResult> {
  try {
    await costingQuotationService.cancelEntry(id, projectId);
    refresh(projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function saveQuotationAction(
  id: string | null,
  input: {
    projectId: string;
    quotationDate: string;
    quotationAmount: string;
    quotationLink: string;
    status: string;
    notes: string;
  },
): Promise<CostingActionResult> {
  try {
    const allowedStatuses = quotationStatuses.filter(
      (value) => value !== "Superseded",
    ) as readonly CurrentQuotationStatus[];
    const serviceInput = {
      ...input,
      status: requireOption<CurrentQuotationStatus>(
        input.status,
        allowedStatuses,
        "status",
      ),
    };
    if (id) {
      await costingQuotationService.editDraftQuotation(id, serviceInput);
    } else {
      await costingQuotationService.addQuotation(serviceInput);
    }
    refresh(input.projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function markQuotationFinalAction(
  id: string,
  projectId: string,
): Promise<CostingActionResult> {
  try {
    await costingQuotationService.markQuotationFinal(id, projectId);
    refresh(projectId);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}
