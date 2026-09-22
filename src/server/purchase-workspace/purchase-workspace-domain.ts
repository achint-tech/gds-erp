export const purchaseWorkspaceStatuses = [
  "Not Started",
  "In Progress",
  "Ordering",
  "Partially Received",
  "Received",
  "Closed",
] as const;
export type PurchaseWorkspaceStatus =
  (typeof purchaseWorkspaceStatuses)[number];
export type PurchaseOwner = { id: string; displayName: string };
export type PurchaseWorkspace = {
  id: string;
  projectId: string;
  purchaseOwnerUserId: string | null;
  purchaseOwner: string | null;
  status: PurchaseWorkspaceStatus;
  purchaseSheetLink: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type SavePurchaseWorkspaceInput = {
  projectId: string;
  purchaseOwnerUserId?: string | null;
  status?: PurchaseWorkspaceStatus;
  purchaseSheetLink?: string | null;
  notes?: string | null;
};
export class PurchaseWorkspaceValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super("Purchase workspace validation failed.");
    this.name = "PurchaseWorkspaceValidationError";
  }
}
const optional = (value?: string | null) => value?.trim() || null;
export function isGoogleSheetUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "docs.google.com" &&
      /^\/spreadsheets\/d\/[a-zA-Z0-9_-]+(?:\/|$)/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
export function getGoogleSheetEmbedUrl(value: string | null) {
  if (!value || !isGoogleSheetUrl(value)) return null;
  const match = new URL(value).pathname.match(
    /^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
  );
  return match
    ? `https://docs.google.com/spreadsheets/d/${match[1]}/preview`
    : null;
}
export interface PurchaseWorkspaceStore {
  listActiveOwners(): Promise<PurchaseOwner[]>;
  isActiveOwner(id: string): Promise<boolean>;
  get(projectId: string): Promise<PurchaseWorkspace | null>;
  upsert(
    input: Required<SavePurchaseWorkspaceInput>,
  ): Promise<PurchaseWorkspace>;
}
export function createPurchaseWorkspaceService(store: PurchaseWorkspaceStore) {
  return {
    listActiveOwners: () => store.listActiveOwners(),
    async getWorkspace(projectId: string) {
      const [owners, workspace] = await Promise.all([
        store.listActiveOwners(),
        store.get(projectId),
      ]);
      return {
        owners,
        workspace,
        embedUrl: getGoogleSheetEmbedUrl(workspace?.purchaseSheetLink ?? null),
      };
    },
    async save(input: SavePurchaseWorkspaceInput) {
      const owner = optional(input.purchaseOwnerUserId);
      const link = optional(input.purchaseSheetLink);
      const errors: Record<string, string> = {};
      if (owner && !(await store.isActiveOwner(owner))) {
        errors.purchaseOwnerUserId = "Select an active Purchase Owner.";
      }
      if (link && !isGoogleSheetUrl(link)) {
        errors.purchaseSheetLink =
          "Enter an HTTPS docs.google.com/spreadsheets Google Sheet URL.";
      }
      if (Object.keys(errors).length) {
        throw new PurchaseWorkspaceValidationError(errors);
      }
      return store.upsert({
        projectId: input.projectId,
        purchaseOwnerUserId: owner,
        status: input.status ?? "Not Started",
        purchaseSheetLink: link,
        notes: optional(input.notes),
      });
    },
  };
}
export type PurchaseWorkspaceData = Awaited<
  ReturnType<ReturnType<typeof createPurchaseWorkspaceService>["getWorkspace"]>
>;
