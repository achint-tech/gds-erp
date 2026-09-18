export const clientPurchaseOrderStatuses = ["Active", "Cancelled"] as const;

export type ClientPurchaseOrderStatus =
  (typeof clientPurchaseOrderStatuses)[number];

export type ClientPurchaseOrder = {
  id: string;
  projectId: string;
  poNumber: string;
  poDate: string;
  poAmount: string;
  poDocumentLink: string | null;
  notes: string | null;
  status: ClientPurchaseOrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveClientPurchaseOrderInput = {
  projectId: string;
  poNumber: string;
  poDate: string;
  poAmount: string;
  poDocumentLink?: string | null;
  notes?: string | null;
};

export class ClientPurchaseOrderValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string>) {
    super("Client PO validation failed.");
    this.name = "ClientPurchaseOrderValidationError";
  }
}

function moneyToPaise(value: string) {
  const match = /^(\d{1,16})(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  return (
    BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"))
  );
}

export function normalizePoAmount(value: string) {
  const paise = moneyToPaise(value);
  if (paise === null || paise <= BigInt(0)) return null;
  const rupees = paise / BigInt(100);
  const fraction = String(paise % BigInt(100)).padStart(2, "0");
  return `${rupees}.${fraction}`;
}

export function validateClientPurchaseOrder(
  input: SaveClientPurchaseOrderInput,
) {
  const fieldErrors: Record<string, string> = {};
  if (!input.poNumber.trim()) fieldErrors.poNumber = "PO Number is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.poDate)) {
    fieldErrors.poDate = "PO Date is required.";
  }
  if (!normalizePoAmount(input.poAmount)) {
    fieldErrors.poAmount = "PO Amount must be greater than zero.";
  }
  return fieldErrors;
}

export function getClientPurchaseOrderSummary(
  purchaseOrders: ClientPurchaseOrder[],
) {
  const activePurchaseOrders = purchaseOrders.filter(
    ({ status }) => status === "Active",
  );
  const totalPaise = activePurchaseOrders.reduce(
    (total, purchaseOrder) =>
      total + (moneyToPaise(purchaseOrder.poAmount) ?? BigInt(0)),
    BigInt(0),
  );
  return {
    activeCount: activePurchaseOrders.length,
    totalPoValue: `${totalPaise / BigInt(100)}.${String(totalPaise % BigInt(100)).padStart(2, "0")}`,
  };
}

export function formatIndianRupees(value: string) {
  const paise = moneyToPaise(value) ?? BigInt(0);
  const whole = String(paise / BigInt(100));
  const lastThree = whole.slice(-3);
  const leading = whole.slice(0, -3);
  const groupedLeading = leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = leading ? `${groupedLeading},${lastThree}` : lastThree;
  const fraction = String(paise % BigInt(100)).padStart(2, "0");
  return `₹${grouped}${fraction === "00" ? "" : `.${fraction}`}`;
}

export interface ClientPurchaseOrderStore {
  list(projectId: string): Promise<ClientPurchaseOrder[]>;
  create(
    input: SaveClientPurchaseOrderInput & { poAmount: string },
  ): Promise<ClientPurchaseOrder>;
  update(
    id: string,
    input: SaveClientPurchaseOrderInput & {
      poAmount: string;
    },
  ): Promise<ClientPurchaseOrder>;
  cancel(id: string, projectId: string): Promise<ClientPurchaseOrder>;
}

export function createClientPurchaseOrderService(
  store: ClientPurchaseOrderStore,
) {
  const validated = (input: SaveClientPurchaseOrderInput) => {
    const fieldErrors = validateClientPurchaseOrder(input);
    if (Object.keys(fieldErrors).length) {
      throw new ClientPurchaseOrderValidationError(fieldErrors);
    }
    return {
      ...input,
      poNumber: input.poNumber.trim(),
      poAmount: normalizePoAmount(input.poAmount)!,
      poDocumentLink: input.poDocumentLink?.trim() || null,
      notes: input.notes?.trim() || null,
    };
  };

  return {
    list(projectId: string) {
      return store.list(projectId);
    },
    add(input: SaveClientPurchaseOrderInput) {
      return store.create(validated(input));
    },
    edit(id: string, input: SaveClientPurchaseOrderInput) {
      return store.update(id, validated(input));
    },
    cancel(id: string, projectId: string) {
      return store.cancel(id, projectId);
    },
  };
}
