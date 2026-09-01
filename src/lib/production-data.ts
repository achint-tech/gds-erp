export const productionStatuses = [
  "Planning",
  "Waiting for Drawing",
  "Waiting for Material",
  "Ready to Start",
  "In Production",
  "QC",
  "Rework",
  "Packing",
  "Ready for Dispatch",
  "Dispatched",
] as const;

export const materialStatuses = [
  "Not Raised",
  "Requested",
  "Partially Available",
  "Available",
  "Waiting for Material",
] as const;

export const productionProcessNames = [
  "Carpentry",
  "Welding",
  "Metal Work",
  "Painting",
  "Powder Coating",
  "Polishing",
  "Electrical / LED",
  "Sticker / Branding",
  "Assembly",
  "Finishing",
  "Packing",
  "Other",
] as const;

export const delayReasons = [
  "Material",
  "Drawing Revision",
  "Manpower",
  "Outsourced Process",
  "Machine",
  "Rework",
  "Client Change",
  "Other",
] as const;

export const qcStatuses = ["Pending", "Passed", "Rework Required"] as const;

export type ProductionStatus = (typeof productionStatuses)[number];
export type MaterialStatus = (typeof materialStatuses)[number];
export type ProductionProcessName = (typeof productionProcessNames)[number];
export type DelayReason = (typeof delayReasons)[number];
export type QCStatus = (typeof qcStatuses)[number];
export type ProductionProcess = {
  name: ProductionProcessName;
  executionType: "In-house" | "Outsourced";
};
export type LabourTaker = {
  teamOrTakerName: string;
  agreedLabourCost: string;
  advancePaid: string;
  balanceAmount: string;
  notes: string;
};
export type ProductionQC = {
  qcStatus: QCStatus;
  qcDate: string;
  qcPerson: string;
  qcChecklistLink: string;
  qcPhotosLink: string;
  checkedQty: number;
  passedQty: number;
  reworkQty: number;
  reworkNotes: string;
  reworkDeadline: string;
};
export type ProductionRecord = {
  id: string;
  jobCode: string;
  fixtureName: string;
  requiredQty: number;
  completedQty: number;
  packedQty: number;
  productionManager: string;
  projectManager: string;
  drawingLink: string;
  drawingVersion: string;
  plannedStartDate: string;
  actualStartDate: string;
  internalDeadline: string;
  actualManufacturingCompletionDate: string;
  status: ProductionStatus;
  materialRequirementLink: string;
  materialStatus: MaterialStatus;
  delayReason: DelayReason | "";
  delayNotes: string;
  processes: ProductionProcess[];
  labour: LabourTaker;
  qc: ProductionQC;
  notes: string;
};

const drive = "https://drive.google.com/";
export const productionRecords: ProductionRecord[] = [
  {
    id: "PROD-149-01",
    jobCode: "GDS149",
    fixtureName: "Fictional Display Counter",
    requiredQty: 30,
    completedQty: 18,
    packedQty: 0,
    productionManager: "Prototype Production Manager",
    projectManager: "Sachin",
    drawingLink: drive,
    drawingVersion: "V2",
    plannedStartDate: "2026-08-20",
    actualStartDate: "2026-08-21",
    internalDeadline: "2026-08-30",
    actualManufacturingCompletionDate: "",
    status: "In Production",
    materialRequirementLink: drive,
    materialStatus: "Partially Available",
    delayReason: "Material",
    delayNotes: "Fictional material balance pending.",
    processes: [
      { name: "Carpentry", executionType: "In-house" },
      { name: "Painting", executionType: "Outsourced" },
      { name: "Assembly", executionType: "In-house" },
    ],
    labour: {
      teamOrTakerName: "Prototype Team A",
      agreedLabourCost: "₹90,000",
      advancePaid: "₹25,000",
      balanceAmount: "₹65,000",
      notes: "Display only; no payment workflow.",
    },
    qc: {
      qcStatus: "Pending",
      qcDate: "",
      qcPerson: "",
      qcChecklistLink: "",
      qcPhotosLink: "",
      checkedQty: 0,
      passedQty: 0,
      reworkQty: 0,
      reworkNotes: "",
      reworkDeadline: "",
    },
    notes: "Fictional batch record.",
  },
  {
    id: "PROD-149-02",
    jobCode: "GDS149",
    fixtureName: "Fictional Wall Unit",
    requiredQty: 12,
    completedQty: 12,
    packedQty: 12,
    productionManager: "Prototype Production Manager",
    projectManager: "Sachin",
    drawingLink: drive,
    drawingVersion: "V1",
    plannedStartDate: "2026-08-15",
    actualStartDate: "2026-08-15",
    internalDeadline: "2026-08-27",
    actualManufacturingCompletionDate: "2026-08-26",
    status: "Ready for Dispatch",
    materialRequirementLink: drive,
    materialStatus: "Available",
    delayReason: "",
    delayNotes: "",
    processes: [
      { name: "Metal Work", executionType: "In-house" },
      { name: "Packing", executionType: "In-house" },
    ],
    labour: {
      teamOrTakerName: "Prototype Team B",
      agreedLabourCost: "₹45,000",
      advancePaid: "₹15,000",
      balanceAmount: "₹30,000",
      notes: "",
    },
    qc: {
      qcStatus: "Passed",
      qcDate: "2026-08-27",
      qcPerson: "Prototype QC Person",
      qcChecklistLink: drive,
      qcPhotosLink: drive,
      checkedQty: 12,
      passedQty: 12,
      reworkQty: 0,
      reworkNotes: "",
      reworkDeadline: "",
    },
    notes: "Fictional completed fixture batch.",
  },
  {
    id: "PROD-150-01",
    jobCode: "GDS150",
    fixtureName: "Fictional Fixture Bay",
    requiredQty: 20,
    completedQty: 20,
    packedQty: 8,
    productionManager: "Prototype Production Manager",
    projectManager: "Neeraj",
    drawingLink: drive,
    drawingVersion: "V1",
    plannedStartDate: "2026-08-18",
    actualStartDate: "2026-08-19",
    internalDeadline: "2026-09-03",
    actualManufacturingCompletionDate: "2026-08-31",
    status: "Rework",
    materialRequirementLink: drive,
    materialStatus: "Available",
    delayReason: "Rework",
    delayNotes: "Fictional finish correction required.",
    processes: [
      { name: "Carpentry", executionType: "In-house" },
      { name: "Polishing", executionType: "Outsourced" },
      { name: "Packing", executionType: "In-house" },
    ],
    labour: {
      teamOrTakerName: "Prototype Taker C",
      agreedLabourCost: "₹72,000",
      advancePaid: "₹20,000",
      balanceAmount: "₹52,000",
      notes: "",
    },
    qc: {
      qcStatus: "Rework Required",
      qcDate: "2026-09-01",
      qcPerson: "Prototype QC Person",
      qcChecklistLink: drive,
      qcPhotosLink: drive,
      checkedQty: 20,
      passedQty: 17,
      reworkQty: 3,
      reworkNotes: "Fictional surface correction.",
      reworkDeadline: "2026-09-02",
    },
    notes: "Fictional QC rework example.",
  },
  {
    id: "PROD-150-02",
    jobCode: "GDS150",
    fixtureName: "Fictional Metal Plinth",
    requiredQty: 10,
    completedQty: 4,
    packedQty: 0,
    productionManager: "Prototype Production Manager",
    projectManager: "Neeraj",
    drawingLink: drive,
    drawingVersion: "V2",
    plannedStartDate: "2026-08-25",
    actualStartDate: "2026-08-26",
    internalDeadline: "2026-08-29",
    actualManufacturingCompletionDate: "",
    status: "In Production",
    materialRequirementLink: drive,
    materialStatus: "Available",
    delayReason: "Machine",
    delayNotes: "Fictional machine-delay demonstration.",
    processes: [
      { name: "Welding", executionType: "In-house" },
      { name: "Powder Coating", executionType: "Outsourced" },
    ],
    labour: {
      teamOrTakerName: "Prototype Team D",
      agreedLabourCost: "₹38,000",
      advancePaid: "₹10,000",
      balanceAmount: "₹28,000",
      notes: "",
    },
    qc: {
      qcStatus: "Pending",
      qcDate: "",
      qcPerson: "",
      qcChecklistLink: "",
      qcPhotosLink: "",
      checkedQty: 0,
      passedQty: 0,
      reworkQty: 0,
      reworkNotes: "",
      reworkDeadline: "",
    },
    notes: "Fictional overdue fixture batch.",
  },
];
