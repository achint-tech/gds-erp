import type {
  DispatchItem,
  DispatchRecord,
  ProductionQC,
  ProductionRecord,
} from "./production-data";

const DAY_MS = 86_400_000;
function localDay(value: string | Date) {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function daysFromToday(value: string, today: Date) {
  return Math.round(
    (localDay(value).getTime() - localDay(today).getTime()) / DAY_MS,
  );
}
export function getProductionProgress(
  record: Pick<ProductionRecord, "requiredQty" | "completedQty" | "packedQty">,
) {
  const required = Math.max(0, record.requiredQty);
  const completed = Math.min(required, Math.max(0, record.completedQty));
  const packed = Math.min(required, Math.max(0, record.packedQty));
  return {
    pendingQty: Math.max(0, required - completed),
    completionPercent:
      required === 0 ? 0 : Math.round((completed / required) * 100),
    packedPendingQty: Math.max(0, required - packed),
  };
}
export function getProductionHealth(
  record: ProductionRecord,
  today = new Date(),
) {
  const { pendingQty } = getProductionProgress(record);
  if (pendingQty === 0)
    return { health: "Completed" as const, label: "Completed", daysDelayed: 0 };
  const daysUntilDeadline = daysFromToday(record.internalDeadline, today);
  if (daysUntilDeadline < 0) {
    const daysDelayed = Math.abs(daysUntilDeadline);
    return {
      health: "Overdue" as const,
      label: `Overdue by ${daysDelayed} ${daysDelayed === 1 ? "day" : "days"}`,
      daysDelayed,
    };
  }
  if (daysUntilDeadline <= 2)
    return { health: "Due Soon" as const, label: "Due Soon", daysDelayed: 0 };
  return { health: "On Track" as const, label: "On Track", daysDelayed: 0 };
}
export function deriveQCStatus(qc: ProductionQC) {
  return qc.reworkQty > 0 ? "Rework Required" : qc.qcStatus;
}

export function getFixtureDispatchedQty(
  fixtureId: string,
  dispatches: DispatchRecord[],
) {
  return dispatches
    .filter((dispatch) => dispatch.status === "Dispatched")
    .flatMap((dispatch) => dispatch.items)
    .filter((item) => item.fixtureId === fixtureId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getDispatchSummary(
  records: ProductionRecord[],
  dispatches: DispatchRecord[],
) {
  const totalRequiredQty = records.reduce(
    (sum, record) => sum + record.requiredQty,
    0,
  );
  const totalProducedQty = records.reduce(
    (sum, record) => sum + record.completedQty,
    0,
  );
  const totalQCPassedQty = records.reduce(
    (sum, record) => sum + Math.min(record.requiredQty, record.qc.passedQty),
    0,
  );
  const totalPackedQty = records.reduce(
    (sum, record) => sum + Math.min(record.requiredQty, record.packedQty),
    0,
  );
  const totalDispatchAvailable = records.reduce(
    (sum, record) =>
      sum + Math.min(record.requiredQty, record.packedQty, record.qc.passedQty),
    0,
  );
  const totalDispatchedQty = records.reduce(
    (sum, record) => sum + getFixtureDispatchedQty(record.id, dispatches),
    0,
  );
  const pendingDispatchQty = Math.max(0, totalRequiredQty - totalDispatchedQty);
  const dispatchStatus =
    totalRequiredQty > 0 && totalDispatchedQty >= totalRequiredQty
      ? "Fully Dispatched"
      : totalDispatchedQty > 0
        ? "Partially Dispatched"
        : totalDispatchAvailable > 0
          ? "Ready for Dispatch"
          : "Not Ready";
  return {
    totalRequiredQty,
    totalProducedQty,
    totalQCPassedQty,
    totalPackedQty,
    totalDispatchedQty,
    pendingDispatchQty,
    dispatchStatus,
  };
}

export function validateDispatchItems(
  items: DispatchItem[],
  records: ProductionRecord[],
  dispatches: DispatchRecord[],
) {
  if (items.length === 0)
    return { valid: false as const, message: "Add at least one fixture." };
  const requested = new Map<string, number>();
  for (const item of items) {
    if (item.quantity <= 0)
      return {
        valid: false as const,
        message: "Dispatch quantity must be greater than zero.",
      };
    requested.set(
      item.fixtureId,
      (requested.get(item.fixtureId) ?? 0) + item.quantity,
    );
  }
  for (const [fixtureId, quantity] of requested) {
    const record = records.find((item) => item.id === fixtureId);
    if (!record)
      return { valid: false as const, message: "Select a valid fixture." };
    const available = Math.min(record.packedQty, record.qc.passedQty);
    const alreadyDispatched = getFixtureDispatchedQty(fixtureId, dispatches);
    if (alreadyDispatched + quantity > available)
      return {
        valid: false as const,
        message: `${record.fixtureName} exceeds its packed and QC-passed quantity.`,
      };
  }
  return { valid: true as const, message: "" };
}
