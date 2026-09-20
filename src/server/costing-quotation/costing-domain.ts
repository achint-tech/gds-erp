export const costingWorkflowStatuses = [
  "Not Started",
  "In Progress",
  "Awaiting Cost",
  "Costing Complete",
] as const;
export const costingSources = ["Internal", "Vendor"] as const;
export const costingEntryStatuses = [
  "Awaiting",
  "Received",
  "Finalised",
  "Cancelled",
] as const;
export const costingWorkCategories = [
  "Civil",
  "Electrical",
  "HVAC",
  "Fire",
  "Fixtures",
  "Metal Fixtures",
  "Signage / Branding",
  "MEP",
  "Flooring",
  "Ceiling",
  "Painting",
  "Plumbing",
  "Installation",
  "Logistics",
  "Other",
] as const;
export const quotationStatuses = [
  "Draft",
  "Submitted",
  "Superseded",
  "Final",
] as const;

export type CostingWorkflowStatus = (typeof costingWorkflowStatuses)[number];
export type CostingSource = (typeof costingSources)[number];
export type CostingEntryStatus = (typeof costingEntryStatuses)[number];
export type CostingWorkCategory = (typeof costingWorkCategories)[number];
export type QuotationStatus = (typeof quotationStatuses)[number];
export type CurrentQuotationStatus = Exclude<QuotationStatus, "Superseded">;

export type CostingRequirement = {
  id: string;
  projectId: string;
  requirementReceivedDate: string | null;
  requirementBoqLink: string | null;
  scopeNotes: string | null;
  costingStatus: CostingWorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CostingEntry = {
  id: string;
  projectId: string;
  workCategory: CostingWorkCategory;
  costingSource: CostingSource;
  vendorParty: string | null;
  costAmount: string;
  costingLink: string | null;
  status: CostingEntryStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuotationVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  quotationDate: string;
  quotationAmount: string;
  quotationLink: string | null;
  status: QuotationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveCostingRequirementInput = {
  projectId: string;
  requirementReceivedDate?: string | null;
  requirementBoqLink?: string | null;
  scopeNotes?: string | null;
  costingStatus: CostingWorkflowStatus;
};

export type SaveCostingEntryInput = {
  projectId: string;
  workCategory: CostingWorkCategory;
  costingSource: CostingSource;
  vendorParty?: string | null;
  costAmount: string;
  costingLink?: string | null;
  status: Exclude<CostingEntryStatus, "Cancelled">;
  notes?: string | null;
};

export type SaveQuotationInput = {
  projectId: string;
  quotationDate: string;
  quotationAmount: string;
  quotationLink?: string | null;
  status: CurrentQuotationStatus;
  notes?: string | null;
};

export class CostingValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super("Costing & Quotation validation failed.");
    this.name = "CostingValidationError";
  }
}

function moneyToPaise(value: string) {
  const match = /^(\d{1,16})(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  return (
    BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"))
  );
}

export function normalizeMoney(value: string) {
  const paise = moneyToPaise(value);
  if (paise === null || paise <= BigInt(0)) return null;
  return `${paise / BigInt(100)}.${String(paise % BigInt(100)).padStart(2, "0")}`;
}

export function formatIndianRupees(value: string | null) {
  if (!value) return "—";
  const paise = moneyToPaise(value);
  if (paise === null) return "—";
  const whole = String(paise / BigInt(100));
  const lastThree = whole.slice(-3);
  const leading = whole.slice(0, -3);
  const groupedLeading = leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = leading ? `${groupedLeading},${lastThree}` : lastThree;
  const fraction = String(paise % BigInt(100)).padStart(2, "0");
  return `₹${grouped}${fraction === "00" ? "" : `.${fraction}`}`;
}

function optional(value?: string | null) {
  return value?.trim() || null;
}

function validateMoneyAndDate(amount: string, date?: string) {
  const fieldErrors: Record<string, string> = {};
  if (!normalizeMoney(amount)) {
    fieldErrors.amount = "Amount must be greater than zero.";
  }
  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fieldErrors.date = "Date is required.";
  }
  if (Object.keys(fieldErrors).length) {
    throw new CostingValidationError(fieldErrors);
  }
}

export function getCostingQuotationSummary(
  requirement: CostingRequirement | null,
  entries: CostingEntry[],
  quotations: QuotationVersion[],
) {
  const activeEntries = entries.filter(({ status }) => status !== "Cancelled");
  const recordedPaise = activeEntries.reduce(
    (total, entry) => total + (moneyToPaise(entry.costAmount) ?? BigInt(0)),
    BigInt(0),
  );
  const latestQuotation = [...quotations].sort(
    (left, right) => right.versionNumber - left.versionNumber,
  )[0];
  const finalQuotation = quotations.find(({ status }) => status === "Final");
  return {
    costingStatus: requirement?.costingStatus ?? "Not Started",
    activeCostingEntryCount: activeEntries.length,
    recordedCostingAmount: `${recordedPaise / BigInt(100)}.${String(recordedPaise % BigInt(100)).padStart(2, "0")}`,
    latestQuotationVersion: latestQuotation
      ? `V${latestQuotation.versionNumber}`
      : null,
    latestQuotationAmount: latestQuotation?.quotationAmount ?? null,
    finalQuotationValue: finalQuotation?.quotationAmount ?? null,
  };
}

export type CostingQuotationWorkspaceData = {
  requirement: CostingRequirement | null;
  entries: CostingEntry[];
  quotations: QuotationVersion[];
  summary: ReturnType<typeof getCostingQuotationSummary>;
};

export interface CostingQuotationStore {
  getRequirement(projectId: string): Promise<CostingRequirement | null>;
  saveRequirement(
    input: SaveCostingRequirementInput,
  ): Promise<CostingRequirement>;
  listEntries(projectId: string): Promise<CostingEntry[]>;
  createEntry(input: SaveCostingEntryInput): Promise<CostingEntry>;
  updateEntry(id: string, input: SaveCostingEntryInput): Promise<CostingEntry>;
  cancelEntry(id: string, projectId: string): Promise<CostingEntry>;
  listQuotations(projectId: string): Promise<QuotationVersion[]>;
  createQuotationVersion(input: SaveQuotationInput): Promise<QuotationVersion>;
  updateDraftQuotation(
    id: string,
    input: SaveQuotationInput,
  ): Promise<QuotationVersion>;
  markQuotationFinal(id: string, projectId: string): Promise<QuotationVersion>;
}

export function createCostingQuotationService(store: CostingQuotationStore) {
  const cleanRequirement = (input: SaveCostingRequirementInput) => ({
    ...input,
    requirementReceivedDate: optional(input.requirementReceivedDate),
    requirementBoqLink: optional(input.requirementBoqLink),
    scopeNotes: optional(input.scopeNotes),
  });
  const cleanEntry = (input: SaveCostingEntryInput) => {
    validateMoneyAndDate(input.costAmount);
    return {
      ...input,
      vendorParty: optional(input.vendorParty),
      costAmount: normalizeMoney(input.costAmount)!,
      costingLink: optional(input.costingLink),
      notes: optional(input.notes),
    };
  };
  const cleanQuotation = (input: SaveQuotationInput) => {
    validateMoneyAndDate(input.quotationAmount, input.quotationDate);
    return {
      ...input,
      quotationAmount: normalizeMoney(input.quotationAmount)!,
      quotationLink: optional(input.quotationLink),
      notes: optional(input.notes),
    };
  };

  return {
    async getWorkspace(projectId: string) {
      const [requirement, entries, quotations] = await Promise.all([
        store.getRequirement(projectId),
        store.listEntries(projectId),
        store.listQuotations(projectId),
      ]);
      return {
        requirement,
        entries,
        quotations,
        summary: getCostingQuotationSummary(requirement, entries, quotations),
      };
    },
    saveRequirement(input: SaveCostingRequirementInput) {
      return store.saveRequirement(cleanRequirement(input));
    },
    addEntry(input: SaveCostingEntryInput) {
      return store.createEntry(cleanEntry(input));
    },
    editEntry(id: string, input: SaveCostingEntryInput) {
      return store.updateEntry(id, cleanEntry(input));
    },
    cancelEntry(id: string, projectId: string) {
      return store.cancelEntry(id, projectId);
    },
    addQuotation(input: SaveQuotationInput) {
      return store.createQuotationVersion(cleanQuotation(input));
    },
    editDraftQuotation(id: string, input: SaveQuotationInput) {
      return store.updateDraftQuotation(id, cleanQuotation(input));
    },
    markQuotationFinal(id: string, projectId: string) {
      return store.markQuotationFinal(id, projectId);
    },
  };
}
