export const billTypes = ["Final Bill", "Additional Bill"] as const;
export const billStatuses = ["Raised", "Submitted", "Approved"] as const;

export type BillRecord = {
  id: string;
  billType: (typeof billTypes)[number];
  billNo: string;
  billDate: string;
  billAmount: number;
  status: (typeof billStatuses)[number];
};

export const billsByJobCode: Record<string, BillRecord[]> = {
  GDS149: [
    {
      id: "BILL-149-01",
      billType: "Final Bill",
      billNo: "PROTO-149-F",
      billDate: "2026-09-08",
      billAmount: 840000,
      status: "Approved",
    },
  ],
  GDS150: [
    {
      id: "BILL-150-01",
      billType: "Additional Bill",
      billNo: "PROTO-150-A1",
      billDate: "2026-09-08",
      billAmount: 75000,
      status: "Submitted",
    },
  ],
};
