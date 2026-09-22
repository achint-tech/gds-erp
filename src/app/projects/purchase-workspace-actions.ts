"use server";
import { revalidatePath } from "next/cache";
import {
  PurchaseWorkspaceValidationError,
  purchaseWorkspaceStatuses,
  type PurchaseWorkspaceStatus,
} from "@/server/purchase-workspace/purchase-workspace-domain";
import { purchaseWorkspaceService } from "@/server/purchase-workspace/purchase-workspace-service";
export type PurchaseWorkspaceActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};
export async function savePurchaseWorkspaceAction(input: {
  projectId: string;
  purchaseOwnerUserId: string;
  status: string;
  purchaseSheetLink: string;
  notes: string;
}): Promise<PurchaseWorkspaceActionResult> {
  try {
    if (
      !purchaseWorkspaceStatuses.includes(
        input.status as PurchaseWorkspaceStatus,
      )
    )
      throw new PurchaseWorkspaceValidationError({
        status: "Select a valid status.",
      });
    await purchaseWorkspaceService.save({
      ...input,
      purchaseOwnerUserId: input.purchaseOwnerUserId || null,
      status: input.status as PurchaseWorkspaceStatus,
      purchaseSheetLink: input.purchaseSheetLink || null,
      notes: input.notes || null,
    });
    revalidatePath(`/projects/${input.projectId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof PurchaseWorkspaceValidationError)
      return {
        success: false,
        error: "Complete the Purchase workspace fields.",
        fieldErrors: error.fieldErrors,
      };
    return {
      success: false,
      error: "The Purchase workspace could not be saved.",
    };
  }
}
