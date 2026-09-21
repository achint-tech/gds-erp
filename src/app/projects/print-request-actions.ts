"use server";
import { revalidatePath } from "next/cache";
import {
  PrintRequestValidationError,
  printRequestStatuses,
  printSizeUnits,
  printTypes,
  type PrintRequestStatus,
  type PrintSizeUnit,
  type PrintType,
} from "@/server/print-requests/print-request-domain";
import { printRequestService } from "@/server/print-requests/print-request-service";
export type PrintRequestActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};
function option<T extends string>(
  value: string,
  values: readonly T[],
  field: string,
) {
  if (!values.includes(value as T))
    throw new PrintRequestValidationError({
      [field]: "Select a valid option.",
    });
  return value as T;
}
export async function savePrintRequestAction(
  id: string | null,
  input: {
    projectId: string;
    printType: string;
    description: string;
    width: string;
    height: string;
    sizeUnit: string;
    quantity: number;
    location: string;
    artworkLink: string;
    requestedByUserId: string;
    requiredByDate: string;
    vendorName: string;
    status: string;
    notes: string;
  },
): Promise<PrintRequestActionResult> {
  try {
    const data = {
      ...input,
      printType: option<PrintType>(input.printType, printTypes, "printType"),
      width: input.width || null,
      height: input.height || null,
      sizeUnit: input.sizeUnit
        ? option<PrintSizeUnit>(input.sizeUnit, printSizeUnits, "sizeUnit")
        : null,
      artworkLink: input.artworkLink || null,
      requiredByDate: input.requiredByDate || null,
      vendorName: input.vendorName || null,
      status: option<PrintRequestStatus>(
        input.status,
        printRequestStatuses,
        "status",
      ),
      notes: input.notes || null,
    };
    if (id) await printRequestService.edit(id, data);
    else await printRequestService.add(data);
    revalidatePath(`/projects/${input.projectId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof PrintRequestValidationError)
      return {
        success: false,
        error: "Complete the required Print Request fields.",
        fieldErrors: error.fieldErrors,
      };
    return { success: false, error: "The Print Request could not be saved." };
  }
}
