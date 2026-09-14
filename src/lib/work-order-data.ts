export const workOrderCategories = [
  "Civil",
  "Electrical",
  "HVAC",
  "Fire",
  "Flooring",
  "Ceiling",
  "Painting",
  "Plumbing",
  "Installation",
  "Signage / Branding",
  "Other",
] as const;
export const commercialBases = ["Lump Sum", "Measurement Based"] as const;
export const workOrderStatuses = [
  "Draft",
  "Issued",
  "In Progress",
  "Completed",
  "Measurement Pending",
  "Payable Ready",
  "Closed",
] as const;

export type WorkOrder = {
  id: string;
  jobCode: string;
  workCategory: (typeof workOrderCategories)[number];
  vendorName: string;
  scopeSummary: string;
  workOrderNo: string;
  workOrderDate: string;
  commercialBasis: (typeof commercialBases)[number];
  agreedAmount: number;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate: string;
  status: (typeof workOrderStatuses)[number];
  workOrderDriveLink: string;
  measurementDriveLink: string;
  payableAmount: number;
  notes: string;
};

const drive = "https://drive.google.com/";
export const workOrders: WorkOrder[] = [
  {
    id: "WO-149-01",
    jobCode: "GDS149",
    workCategory: "Electrical",
    vendorName: "Fictional Electrical Works",
    scopeSummary: "Fictional outsourced electrical execution scope.",
    workOrderNo: "PROTO-WO-149-01",
    workOrderDate: "2026-08-20",
    commercialBasis: "Lump Sum",
    agreedAmount: 180000,
    startDate: "2026-08-24",
    targetCompletionDate: "2026-09-04",
    actualCompletionDate: "2026-09-03",
    status: "Closed",
    workOrderDriveLink: drive,
    measurementDriveLink: "",
    payableAmount: 180000,
    notes: "Fictional completed outsourced work order.",
  },
  {
    id: "WO-150-01",
    jobCode: "GDS150",
    workCategory: "Installation",
    vendorName: "Prototype Installation Services",
    scopeSummary: "Fictional measurement-based fixture installation scope.",
    workOrderNo: "PROTO-WO-150-01",
    workOrderDate: "2026-08-28",
    commercialBasis: "Measurement Based",
    agreedAmount: 95000,
    startDate: "2026-09-01",
    targetCompletionDate: "2026-09-10",
    actualCompletionDate: "2026-09-09",
    status: "Measurement Pending",
    workOrderDriveLink: drive,
    measurementDriveLink: "",
    payableAmount: 0,
    notes: "Fictional measurement pending example.",
  },
];
