import type { PurchaseRequest, PurchaseRequestStatus } from "./purchase-data";

const DAY_MS = 86_400_000;
function day(value: string | Date) {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function difference(from: Date, to: Date) {
  return Math.round((day(to).getTime() - day(from).getTime()) / DAY_MS);
}
export function isPurchaseFinished(status: PurchaseRequestStatus) {
  return status === "Received" || status === "Closed" || status === "Cancelled";
}
export function getPurchaseHealth(
  request: PurchaseRequest,
  today = new Date(),
) {
  if (isPurchaseFinished(request.status))
    return { health: "Complete", label: request.status };
  const deliveryDays = request.supplierPO?.expectedDeliveryDate
    ? difference(
        today,
        new Date(`${request.supplierPO.expectedDeliveryDate}T00:00:00`),
      )
    : null;
  if (
    (request.status === "PO Issued" ||
      request.status === "Awaiting Delivery") &&
    deliveryDays !== null &&
    deliveryDays < 0
  ) {
    const count = Math.abs(deliveryDays);
    return {
      health: "Delivery Overdue",
      label: `Delivery overdue by ${count} ${count === 1 ? "day" : "days"}`,
    };
  }
  const requiredDays = difference(
    today,
    new Date(`${request.requiredByDate}T00:00:00`),
  );
  if (requiredDays < 0)
    return { health: "Requirement Overdue", label: "Requirement Overdue" };
  if (requiredDays <= 2)
    return { health: "Required Soon", label: "Required Soon" };
  return { health: "On Track", label: "On Track" };
}
export function canEditPurchaseRequest(request: PurchaseRequest) {
  return ![
    "PO Issued",
    "Awaiting Delivery",
    "Received",
    "Replacement Pending",
    "Closed",
    "Cancelled",
  ].includes(request.status);
}
