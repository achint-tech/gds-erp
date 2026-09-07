export const siteStatuses = [
  "Not Started",
  "Recce",
  "Ready to Start",
  "In Progress",
  "Blocked",
  "Site QC",
  "Rectification",
  "Ready for Handover",
  "Handed Over",
] as const;

export const workPackageCategories = [
  "Civil",
  "Electrical",
  "HVAC",
  "Fire",
  "Flooring",
  "Ceiling",
  "Painting",
  "Plumbing",
  "Fixtures Installation",
  "Signage / Branding",
  "Other",
] as const;

export const responsiblePartyTypes = [
  "GDS Team",
  "Vendor",
  "Taker",
  "Other",
] as const;
export const siteWorkStatuses = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Completed",
] as const;
export const siteQCStatuses = [
  "Pending",
  "Passed",
  "Rectification Required",
] as const;
export const handoverStatuses = ["Pending", "Ready", "Handed Over"] as const;
export const measurementStatuses = ["Not Required", "Pending", "Done"] as const;
export const siteDelayReasons = [
  "Client Dependency",
  "Material",
  "Vendor",
  "Manpower",
  "Drawing / Design Change",
  "Site Not Ready",
  "Approval Pending",
  "Production / Dispatch Delay",
  "Rework",
  "Other",
] as const;

export type WorkPackage = {
  id: string;
  category: (typeof workPackageCategories)[number];
  responsiblePartyType: (typeof responsiblePartyTypes)[number];
  responsiblePartyName: string;
  plannedStartDate: string;
  dueDate: string;
  actualStartDate: string;
  actualCompletionDate: string;
  status: (typeof siteWorkStatuses)[number];
  delayReason: (typeof siteDelayReasons)[number] | "";
  notes: string;
};

export type ProgressUpdate = {
  id: string;
  date: string;
  update: string;
  blockerOrDependency: string;
  nextAction: string;
};

export type FixtureReceipt = {
  fixtureId: string;
  receivedAtSiteQty: number;
  installedQty: number;
};

export type SiteExecution = {
  jobCode: string;
  location: string;
  clientDeadline: string;
  workDescription: string;
  recceDate: string;
  plannedSiteStartDate: string;
  actualSiteStartDate: string;
  targetSiteCompletionDate: string;
  actualSiteCompletionDate: string;
  siteStatus: (typeof siteStatuses)[number];
  latestRemarks: string;
  workPackages: WorkPackage[];
  progressUpdates: ProgressUpdate[];
  fixtureReceipts: FixtureReceipt[];
  qc: {
    qcStatus: (typeof siteQCStatuses)[number];
    qcDate: string;
    qcPerson: string;
    qcChecklistOrPhotosLink: string;
    snagCount: number;
    rectificationRequired: boolean;
    rectificationDueDate: string;
    rectificationCompletedDate: string;
    notes: string;
  };
  handover: {
    handoverStatus: (typeof handoverStatuses)[number];
    handoverDate: string;
    handoverDocumentLink: string;
    handoverNotes: string;
  };
  measurementStatus: (typeof measurementStatuses)[number];
  measurementDate: string;
  measurementBy: string;
  measurementDriveLink: string;
  measurementNotes: string;
};

const drive = "https://drive.google.com/";
export const siteExecutionByJobCode: Record<string, SiteExecution> = {
  GDS149: {
    jobCode: "GDS149",
    location: "Example City",
    clientDeadline: "2026-09-08",
    workDescription: "Fictional turnkey site execution demonstration.",
    recceDate: "2026-08-22",
    plannedSiteStartDate: "2026-08-29",
    actualSiteStartDate: "2026-08-30",
    targetSiteCompletionDate: "2026-09-08",
    actualSiteCompletionDate: "2026-09-07",
    siteStatus: "Handed Over",
    latestRemarks: "Fictional site execution and handover completed.",
    workPackages: [
      {
        id: "SWP-149-01",
        category: "Civil",
        responsiblePartyType: "Vendor",
        responsiblePartyName: "Prototype Vendor A",
        plannedStartDate: "2026-08-29",
        dueDate: "2026-09-03",
        actualStartDate: "2026-08-30",
        actualCompletionDate: "2026-09-03",
        status: "Completed",
        delayReason: "",
        notes: "Fictional package.",
      },
      {
        id: "SWP-149-02",
        category: "Electrical",
        responsiblePartyType: "GDS Team",
        responsiblePartyName: "Prototype Site Team",
        plannedStartDate: "2026-09-01",
        dueDate: "2026-09-06",
        actualStartDate: "2026-09-01",
        actualCompletionDate: "",
        status: "In Progress",
        delayReason: "",
        notes: "Fictional package.",
      },
      {
        id: "SWP-149-03",
        category: "Fixtures Installation",
        responsiblePartyType: "Taker",
        responsiblePartyName: "Prototype Taker A",
        plannedStartDate: "2026-09-02",
        dueDate: "2026-09-07",
        actualStartDate: "2026-09-02",
        actualCompletionDate: "",
        status: "In Progress",
        delayReason: "Production / Dispatch Delay",
        notes: "Partial receipt demonstration.",
      },
    ],
    progressUpdates: [
      {
        id: "SUP-149-02",
        date: "2026-09-04",
        update: "Fictional electrical and installation work progressed.",
        blockerOrDependency: "Balance fixtures awaited.",
        nextAction: "Complete installation and start site QC.",
      },
      {
        id: "SUP-149-01",
        date: "2026-08-30",
        update: "Fictional site execution started.",
        blockerOrDependency: "",
        nextAction: "Complete civil package.",
      },
    ],
    fixtureReceipts: [
      { fixtureId: "PROD-149-02", receivedAtSiteQty: 10, installedQty: 8 },
    ],
    qc: {
      qcStatus: "Pending",
      qcDate: "",
      qcPerson: "",
      qcChecklistOrPhotosLink: "",
      snagCount: 0,
      rectificationRequired: false,
      rectificationDueDate: "",
      rectificationCompletedDate: "",
      notes: "",
    },
    handover: {
      handoverStatus: "Handed Over",
      handoverDate: "2026-09-07",
      handoverDocumentLink: drive,
      handoverNotes: "Fictional completed handover example.",
    },
    measurementStatus: "Done",
    measurementDate: "2026-09-07",
    measurementBy: "Prototype Site Engineer",
    measurementDriveLink: drive,
    measurementNotes: "Fictional completed measurement record.",
  },
  GDS150: {
    jobCode: "GDS150",
    location: "Sample City",
    clientDeadline: "2026-09-05",
    workDescription: "Fictional fixtures installation demonstration.",
    recceDate: "2026-08-28",
    plannedSiteStartDate: "2026-09-01",
    actualSiteStartDate: "2026-09-01",
    targetSiteCompletionDate: "2026-09-05",
    actualSiteCompletionDate: "",
    siteStatus: "Rectification",
    latestRemarks: "Fictional QC snags require rectification.",
    workPackages: [
      {
        id: "SWP-150-01",
        category: "Fixtures Installation",
        responsiblePartyType: "GDS Team",
        responsiblePartyName: "Prototype Installation Team",
        plannedStartDate: "2026-09-01",
        dueDate: "2026-09-05",
        actualStartDate: "2026-09-01",
        actualCompletionDate: "",
        status: "In Progress",
        delayReason: "",
        notes: "Partial fixture installation.",
      },
    ],
    progressUpdates: [
      {
        id: "SUP-150-02",
        date: "2026-09-03",
        update: "Fictional partial installation inspected.",
        blockerOrDependency: "Two fictional snags identified.",
        nextAction: "Complete rectification and request re-check.",
      },
      {
        id: "SUP-150-01",
        date: "2026-09-01",
        update: "First dispatched batch received at site.",
        blockerOrDependency: "",
        nextAction: "Begin installation.",
      },
    ],
    fixtureReceipts: [
      { fixtureId: "PROD-150-01", receivedAtSiteQty: 8, installedQty: 6 },
    ],
    qc: {
      qcStatus: "Rectification Required",
      qcDate: "2026-09-03",
      qcPerson: "Prototype QC Person",
      qcChecklistOrPhotosLink: drive,
      snagCount: 2,
      rectificationRequired: true,
      rectificationDueDate: "2026-09-05",
      rectificationCompletedDate: "",
      notes: "Fictional alignment correction.",
    },
    handover: {
      handoverStatus: "Pending",
      handoverDate: "",
      handoverDocumentLink: "",
      handoverNotes: "",
    },
    measurementStatus: "Pending",
    measurementDate: "",
    measurementBy: "",
    measurementDriveLink: "",
    measurementNotes:
      "Measurement will follow site rectification and handover.",
  },
};
