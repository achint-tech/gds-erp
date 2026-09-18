"use server";

import { revalidatePath } from "next/cache";
import {
  ClientPurchaseOrderValidationError,
  type SaveClientPurchaseOrderInput,
} from "@/server/client-purchase-orders/client-po-domain";
import { clientPurchaseOrderService } from "@/server/client-purchase-orders/client-po-service";

export type ClientPoActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function failure(error: unknown): ClientPoActionResult {
  if (error instanceof ClientPurchaseOrderValidationError) {
    return {
      success: false,
      error: "Complete the required Client PO fields.",
      fieldErrors: error.fieldErrors,
    };
  }
  return {
    success: false,
    error: "The Client PO could not be saved. Please try again.",
  };
}

export async function saveClientPoAction(
  id: string | null,
  input: SaveClientPurchaseOrderInput,
): Promise<ClientPoActionResult> {
  try {
    if (id) {
      await clientPurchaseOrderService.edit(id, input);
    } else {
      await clientPurchaseOrderService.add(input);
    }
    revalidatePath(`/projects/${input.projectId}`);
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}

export async function cancelClientPoAction(
  id: string,
  projectId: string,
): Promise<ClientPoActionResult> {
  try {
    await clientPurchaseOrderService.cancel(id, projectId);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "The Client PO could not be cancelled. Please try again.",
    };
  }
}
