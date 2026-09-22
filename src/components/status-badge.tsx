import type { ReactNode } from "react";

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  active: "bg-blue-50 text-blue-800",
  waiting: "bg-amber-50 text-amber-800",
  success: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-800",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
