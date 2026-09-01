import type { ProductionQC, ProductionRecord } from "./production-data";

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
