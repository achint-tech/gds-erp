export const printTypes = [
  "Vinyl",
  "Sticker",
  "Flex",
  "Sunboard",
  "Fabric",
  "Backlit",
  "Other",
] as const;
export const printSizeUnits = ["mm", "cm", "inch", "ft"] as const;
export const printRequestStatuses = [
  "Raised",
  "Sent to Vendor",
  "In Production",
  "Ready",
  "Dispatched",
  "Installed",
  "Cancelled",
] as const;
export type PrintType = (typeof printTypes)[number];
export type PrintSizeUnit = (typeof printSizeUnits)[number];
export type PrintRequestStatus = (typeof printRequestStatuses)[number];
export type Requester = { id: string; displayName: string };
export type PrintRequest = {
  id: string;
  projectId: string;
  printType: PrintType;
  description: string;
  width: string | null;
  height: string | null;
  sizeUnit: PrintSizeUnit | null;
  quantity: number;
  location: string;
  artworkLink: string | null;
  requestedByUserId: string;
  requestedBy: string;
  requiredByDate: string | null;
  vendorName: string | null;
  status: PrintRequestStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type SavePrintRequestInput = Omit<
  PrintRequest,
  "id" | "requestedBy" | "createdAt" | "updatedAt"
>;
export class PrintRequestValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super("Print Request validation failed.");
    this.name = "PrintRequestValidationError";
  }
}
const optional = (value?: string | null) => value?.trim() || null;
function positiveDecimal(value: string) {
  return /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) > 0;
}
export function formatPrintSize(
  request: Pick<PrintRequest, "width" | "height" | "sizeUnit">,
) {
  return request.width && request.height && request.sizeUnit
    ? `${Number(request.width)} × ${Number(request.height)} ${request.sizeUnit}`
    : "—";
}
export function getPrintRequestSummary(requests: PrintRequest[]) {
  return {
    openRequests: requests.filter(
      ({ status }) => status !== "Installed" && status !== "Cancelled",
    ).length,
    inProduction: requests.filter(({ status }) => status === "In Production")
      .length,
    ready: requests.filter(({ status }) => status === "Ready").length,
    installed: requests.filter(({ status }) => status === "Installed").length,
  };
}
export interface PrintRequestStore {
  listActiveRequesters(): Promise<Requester[]>;
  isActiveRequester(id: string): Promise<boolean>;
  list(projectId: string): Promise<PrintRequest[]>;
  create(input: SavePrintRequestInput): Promise<PrintRequest>;
  update(id: string, input: SavePrintRequestInput): Promise<PrintRequest>;
}
export function createPrintRequestService(store: PrintRequestStore) {
  const clean = async (input: SavePrintRequestInput) => {
    const errors: Record<string, string> = {};
    if (!input.description.trim())
      errors.description = "Description is required.";
    if (!input.location.trim()) errors.location = "Location is required.";
    if (!Number.isInteger(input.quantity) || input.quantity <= 0)
      errors.quantity = "Quantity must be positive.";
    const width = optional(input.width),
      height = optional(input.height);
    if (Boolean(width) !== Boolean(height))
      errors.dimensions = "Provide both width and height.";
    if (width && !positiveDecimal(width))
      errors.width = "Width must be positive.";
    if (height && !positiveDecimal(height))
      errors.height = "Height must be positive.";
    if (width && !input.sizeUnit) errors.sizeUnit = "Size unit is required.";
    if (!(await store.isActiveRequester(input.requestedByUserId)))
      errors.requestedByUserId = "Select an active requester.";
    if (Object.keys(errors).length)
      throw new PrintRequestValidationError(errors);
    return {
      ...input,
      description: input.description.trim(),
      location: input.location.trim(),
      width,
      height,
      sizeUnit: width ? input.sizeUnit : null,
      artworkLink: optional(input.artworkLink),
      requiredByDate: optional(input.requiredByDate),
      vendorName: optional(input.vendorName),
      notes: optional(input.notes),
    };
  };
  return {
    listActiveRequesters: () => store.listActiveRequesters(),
    async getWorkspace(projectId: string) {
      const [requesters, requests] = await Promise.all([
        store.listActiveRequesters(),
        store.list(projectId),
      ]);
      return {
        requesters,
        requests,
        summary: getPrintRequestSummary(requests),
      };
    },
    async add(input: SavePrintRequestInput) {
      return store.create(await clean(input));
    },
    async edit(id: string, input: SavePrintRequestInput) {
      return store.update(id, await clean(input));
    },
  };
}
export type PrintRequestWorkspaceData = Awaited<
  ReturnType<ReturnType<typeof createPrintRequestService>["getWorkspace"]>
>;
