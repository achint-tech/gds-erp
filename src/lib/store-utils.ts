import { getTaskHealth } from "./task-timing";
import type {
  InventoryItem,
  MaterialRequest,
  StockAllocation,
} from "./store-data";

export function getShortageQty(allocation: StockAllocation) {
  return Math.max(allocation.requestedQty - allocation.allocatedQty, 0);
}
export function getRemainingAllocation(allocation: StockAllocation) {
  return Math.max(allocation.allocatedQty - allocation.issuedQty, 0);
}
export function getTotalAllocated(itemId: string, requests: MaterialRequest[]) {
  return requests
    .flatMap((request) => request.allocations)
    .filter((allocation) => allocation.inventoryItemId === itemId)
    .reduce((sum, allocation) => sum + getRemainingAllocation(allocation), 0);
}
export function getAvailableStock(
  item: InventoryItem,
  requests: MaterialRequest[],
) {
  return Math.max(
    item.quantityOnHand - getTotalAllocated(item.id, requests),
    0,
  );
}
export function isLowStock(item: InventoryItem) {
  return item.quantityOnHand <= item.reorderLevel;
}
export function validateAllocation(
  allocation: StockAllocation,
  item: InventoryItem,
) {
  const quantities = [
    allocation.requestedQty,
    allocation.availableQty,
    allocation.allocatedQty,
    allocation.issuedQty,
  ];
  if (quantities.some((quantity) => quantity < 0))
    return { valid: false as const, message: "Quantities cannot be negative." };
  if (allocation.allocatedQty > item.quantityOnHand)
    return {
      valid: false as const,
      message: "Allocated quantity cannot exceed stock on hand.",
    };
  if (allocation.issuedQty > allocation.allocatedQty)
    return {
      valid: false as const,
      message: "Issued quantity cannot exceed allocated quantity.",
    };
  return { valid: true as const, message: "" };
}
export function validateIssue(quantity: number, allocation: StockAllocation) {
  if (quantity <= 0)
    return {
      valid: false as const,
      message: "Issue quantity must be greater than zero.",
    };
  if (quantity > getRemainingAllocation(allocation))
    return {
      valid: false as const,
      message: "Issue quantity cannot exceed remaining allocation.",
    };
  return { valid: true as const, message: "" };
}
export function getRequestShortage(request: MaterialRequest) {
  return request.allocations.reduce(
    (sum, allocation) => sum + getShortageQty(allocation),
    0,
  );
}
export function getMaterialRequestHealth(
  request: MaterialRequest,
  today = new Date(),
) {
  return getTaskHealth(
    ["Issued", "Closed"].includes(request.status)
      ? "Completed"
      : request.status,
    request.requiredDate,
    today,
  );
}
export function getStoreSummary(
  items: InventoryItem[],
  requests: MaterialRequest[],
) {
  const open = requests.filter(
    (request) => !["Issued", "Closed"].includes(request.status),
  );
  return {
    inventoryItemCount: items.length,
    openRequestCount: open.length,
    shortageRequestCount: open.filter(
      (request) => getRequestShortage(request) > 0,
    ).length,
    readyToIssueCount: open.filter((request) =>
      request.allocations.some(
        (allocation) => getRemainingAllocation(allocation) > 0,
      ),
    ).length,
    lowStockItemCount: items.filter(isLowStock).length,
  };
}
