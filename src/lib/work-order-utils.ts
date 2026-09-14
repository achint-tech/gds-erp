import { getTaskHealth } from "./task-timing";
import type { WorkOrder } from "./work-order-data";

const completedStatuses = ["Completed", "Payable Ready", "Closed"];

export function getWorkOrderHealth(order: WorkOrder, today = new Date()) {
  return getTaskHealth(
    completedStatuses.includes(order.status) ? "Completed" : order.status,
    order.targetCompletionDate,
    today,
  );
}

export function getWorkOrderSummary(orders: WorkOrder[]) {
  return {
    totalCount: orders.length,
    activeCount: orders.filter(
      (order) => !completedStatuses.includes(order.status),
    ).length,
    completedOrPayableReadyCount: orders.filter(
      (order) =>
        order.status === "Completed" || order.status === "Payable Ready",
    ).length,
    payableReadyCount: orders.filter(
      (order) => order.status === "Payable Ready",
    ).length,
    totalAgreedValue: orders.reduce(
      (sum, order) => sum + order.agreedAmount,
      0,
    ),
    totalPayableValue: orders.reduce(
      (sum, order) => sum + order.payableAmount,
      0,
    ),
    overdueCount: orders.filter(
      (order) => getWorkOrderHealth(order).health === "Overdue",
    ).length,
  };
}

export function validatePayableReady(order: WorkOrder) {
  if (order.status !== "Payable Ready")
    return { valid: true as const, message: "" };
  if (order.payableAmount <= 0)
    return {
      valid: false as const,
      message: "Enter the confirmed payable amount before Payable Ready.",
    };
  if (
    order.commercialBasis === "Measurement Based" &&
    !order.measurementDriveLink
  )
    return {
      valid: false as const,
      message: "Add the external measurement link before Payable Ready.",
    };
  return { valid: true as const, message: "" };
}
