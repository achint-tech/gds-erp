export const approvedProjectTypes = [
  "Civil",
  "SIS",
  "Turnkey",
  "Fixtures",
] as const;

export const approvedProjectStatuses = [
  "Quotation",
  "PO Received",
  "Project Planning",
  "Design in Progress",
  "In Production",
  "Installation",
  "Measurement",
  "Handover",
  "Billing",
  "Payment",
] as const;

export const projectLeads = ["Achint", "Ikjot"] as const;

export const approvedProjectManagers = ["Anumeha", "Sachin", "Neeraj"] as const;

export const currentFinancialYear = "FY 2026-27";
export const nextPrototypeJobCode = "GDS151";

export type ProjectType = (typeof approvedProjectTypes)[number];

export type Project = {
  financialYear: string;
  jobCode: string;
  projectName: string;
  brand: string;
  projectType: ProjectType;
  projectLead: (typeof projectLeads)[number];
  projectManager: string;
  address: string;
  sitePocName: string;
  sitePocEmail: string;
  sitePocPhone: string;
  status: (typeof approvedProjectStatuses)[number];
};

export type PurchaseOrder = {
  poNumber: string;
  poDate: string;
  poAmount: string;
  poDocumentLink: string;
  poNotes: string;
  addedDate: string;
};

export const designTypes = [
  "2D",
  "3D",
  "MEP",
  "HVAC",
  "Production Drawing",
  "Revision",
  "Other",
] as const;
export const designTaskStatuses = [
  "Not Started",
  "In Progress",
  "Completed",
  "Closed",
] as const;
export const clientResponseStatuses = [
  "Not Submitted",
  "Waiting Client",
  "Approved",
  "Revision Requested",
] as const;
export const taskPriorities = ["Normal", "High", "Urgent"] as const;

export type DesignTask = {
  id: string;
  projectJobCode: string;
  designType: (typeof designTypes)[number];
  taskName: string;
  assignedTo: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  completedDate: string;
  submittedDate: string;
  status: (typeof designTaskStatuses)[number];
  clientResponseStatus: (typeof clientResponseStatuses)[number];
  priority: (typeof taskPriorities)[number];
  drawingLink: string;
  version: string;
  previousVersionTaskId: string;
  notes: string;
};

export const activeProjects: Project[] = [
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS145",
    projectName: "Northstar Display Refresh",
    brand: "Fictional Northstar",
    projectType: "Civil",
    projectLead: "Achint",
    projectManager: approvedProjectManagers[0],
    address: "Fictional Site 12, Sample Business District, Example City",
    sitePocName: "Prototype Contact A",
    sitePocEmail: "contact-a@example.invalid",
    sitePocPhone: "+91 00000 00001",
    status: "PO Received",
  },
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS146",
    projectName: "Bluebird Store Fixture",
    brand: "Fictional Bluebird",
    projectType: "Fixtures",
    projectLead: "Ikjot",
    projectManager: approvedProjectManagers[1],
    address: "Fictional Unit 4, Demonstration Avenue, Example City",
    sitePocName: "Prototype Contact B",
    sitePocEmail: "contact-b@example.invalid",
    sitePocPhone: "+91 00000 00002",
    status: "Project Planning",
  },
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS147",
    projectName: "Atlas Site Rollout",
    brand: "Fictional Atlas",
    projectType: "Turnkey",
    projectLead: "Achint",
    projectManager: approvedProjectManagers[2],
    address: "Fictional Plot 88, Mock Industrial Estate, Example City",
    sitePocName: "Prototype Contact C",
    sitePocEmail: "contact-c@example.invalid",
    sitePocPhone: "+91 00000 00003",
    status: "Design in Progress",
  },
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS148",
    projectName: "Cedar Counter Display",
    brand: "Fictional Cedar",
    projectType: "Civil",
    projectLead: "Ikjot",
    projectManager: approvedProjectManagers[0],
    address: "Fictional Shop 21, Sample Central Mall, Example City",
    sitePocName: "Prototype Contact D",
    sitePocEmail: "contact-d@example.invalid",
    sitePocPhone: "+91 00000 00004",
    status: "In Production",
  },
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS149",
    projectName: "Orbit Installation",
    brand: "Fictional Orbit",
    projectType: "Turnkey",
    projectLead: "Achint",
    projectManager: approvedProjectManagers[1],
    address: "Fictional Floor 2, Demonstration Plaza, Example City",
    sitePocName: "Prototype Contact E",
    sitePocEmail: "contact-e@example.invalid",
    sitePocPhone: "+91 00000 00005",
    status: "Installation",
  },
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS150",
    projectName: "Harbor Fixture Update",
    brand: "Fictional Harbor",
    projectType: "Fixtures",
    projectLead: "Ikjot",
    projectManager: approvedProjectManagers[2],
    address: "Fictional Bay 7, Example Commerce Park, Sample City",
    sitePocName: "Prototype Contact F",
    sitePocEmail: "contact-f@example.invalid",
    sitePocPhone: "+91 00000 00006",
    status: "Billing",
  },
];

export const archivedProjects: Project[] = [
  {
    ...activeProjects[0],
    jobCode: "GDS143",
    projectName: "Fictional Prior Display",
  },
  {
    ...activeProjects[1],
    jobCode: "GDS144",
    projectName: "Fictional Prior Fixture",
  },
];

export const purchaseOrdersByJobCode: Record<string, PurchaseOrder> = {
  GDS150: {
    poNumber: "PO-2026-041",
    poDate: "2026-08-27",
    poAmount: "₹10,40,000",
    poDocumentLink: "https://drive.google.com/",
    poNotes: "Fictional prototype PO record.",
    addedDate: "2026-08-27",
  },
};

export const designTasksByJobCode: Record<string, DesignTask[]> = {
  GDS149: [
    {
      id: "DES-149-01",
      projectJobCode: "GDS149",
      designType: "2D",
      taskName: "Fictional Store Layout",
      assignedTo: "Prototype Designer A",
      assignedBy: "Sachin",
      assignedDate: "2026-08-18",
      dueDate: "2026-08-22",
      completedDate: "2026-08-21",
      submittedDate: "2026-08-22",
      status: "Closed",
      clientResponseStatus: "Revision Requested",
      priority: "Normal",
      drawingLink: "https://drive.google.com/",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional submitted version with a revision request.",
    },
    {
      id: "DES-149-02",
      projectJobCode: "GDS149",
      designType: "2D",
      taskName: "Fictional Store Layout",
      assignedTo: "Prototype Designer A",
      assignedBy: "Sachin",
      assignedDate: "2026-08-23",
      dueDate: "2026-08-26",
      completedDate: "2026-08-25",
      submittedDate: "2026-08-26",
      status: "Closed",
      clientResponseStatus: "Approved",
      priority: "Normal",
      drawingLink: "https://drive.google.com/",
      version: "V2",
      previousVersionTaskId: "DES-149-01",
      notes: "Fictional approved second version.",
    },
    {
      id: "DES-149-03",
      projectJobCode: "GDS149",
      designType: "3D",
      taskName: "Fictional Store Concept",
      assignedTo: "Prototype Designer B",
      assignedBy: "Sachin",
      assignedDate: "2026-08-25",
      dueDate: "2026-08-30",
      completedDate: "",
      submittedDate: "",
      status: "In Progress",
      clientResponseStatus: "Not Submitted",
      priority: "High",
      drawingLink: "",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional active design version.",
    },
    {
      id: "DES-149-04",
      projectJobCode: "GDS149",
      designType: "MEP",
      taskName: "Fictional MEP Drawing",
      assignedTo: "Prototype Designer B",
      assignedBy: "Sachin",
      assignedDate: "2026-08-20",
      dueDate: "2026-08-24",
      completedDate: "2026-08-23",
      submittedDate: "2026-08-24",
      status: "Closed",
      clientResponseStatus: "Waiting Client",
      priority: "Urgent",
      drawingLink: "https://drive.google.com/",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional submitted version awaiting client response.",
    },
  ],
  GDS150: [
    {
      id: "DES-150-01",
      projectJobCode: "GDS150",
      designType: "3D",
      taskName: "Fictional Fixture Concept",
      assignedTo: "Prototype Designer A",
      assignedBy: "Neeraj",
      assignedDate: "2026-08-23",
      dueDate: "2026-08-28",
      completedDate: "",
      submittedDate: "",
      status: "In Progress",
      clientResponseStatus: "Not Submitted",
      priority: "High",
      drawingLink: "https://drive.google.com/",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional in-progress design task.",
    },
    {
      id: "DES-150-02",
      projectJobCode: "GDS150",
      designType: "Production Drawing",
      taskName: "Fictional Production Drawing",
      assignedTo: "Prototype Designer B",
      assignedBy: "Neeraj",
      assignedDate: "2026-08-20",
      dueDate: "2026-08-24",
      completedDate: "2026-08-24",
      submittedDate: "",
      status: "Completed",
      clientResponseStatus: "Not Submitted",
      priority: "Normal",
      drawingLink: "https://drive.google.com/",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional completed production drawing.",
    },
    {
      id: "DES-150-03",
      projectJobCode: "GDS150",
      designType: "2D",
      taskName: "Fictional Fixture Layout",
      assignedTo: "Prototype Designer A",
      assignedBy: "Neeraj",
      assignedDate: "2026-08-25",
      dueDate: "2026-08-26",
      completedDate: "2026-08-25",
      submittedDate: "2026-08-26",
      status: "Closed",
      clientResponseStatus: "Waiting Client",
      priority: "Normal",
      drawingLink: "https://drive.google.com/",
      version: "V1",
      previousVersionTaskId: "",
      notes: "Fictional submitted design awaiting client response.",
    },
  ],
};

export const costingStatuses = [
  "Not Started",
  "Awaiting BOQ",
  "Costing In Progress",
  "Awaiting Costing",
  "Costing Received",
  "Under Review",
  "Costing Approved",
  "Quotation Prepared",
  "Quotation Sent",
  "Under Negotiation",
  "PO Awaited",
  "Closed - Lost",
] as const;

export const costingMethods = [
  "Internal Production",
  "External Vendor",
  "Internal + Vendor",
] as const;

export const quotationStatuses = [
  "Not Prepared",
  "Draft",
  "Internal Review",
  "Approved Internally",
  "Sent to Client",
  "Revision Requested",
  "Under Negotiation",
  "Finalised",
  "PO Awaited",
  "Lost",
] as const;

export const costingDocumentTypes = [
  "Client BOQ",
  "Client Drawing",
  "Internal Production Costing",
  "Vendor Costing",
  "Final Costing",
  "Quotation",
  "Revised Quotation",
  "Other",
] as const;

export const costingSourceTypes = ["Internal Production", "Vendor"] as const;

// V1 options are intentionally easy to extend; the list is not final.
export const workCategories = [
  "Civil",
  "Electrical",
  "HVAC",
  "Fire",
  "Fixtures",
  "Metal Fixtures",
  "Signage / Branding",
  "MEP",
  "Flooring",
  "Ceiling",
  "Painting",
  "Plumbing",
  "Installation",
  "Logistics",
  "Other",
] as const;

export const costingSourceStatuses = [
  "Requested",
  "In Progress",
  "Received",
  "Under Review",
  "Approved",
  "Rejected",
] as const;

export type CostingStatus = (typeof costingStatuses)[number];
export type CostingMethod = (typeof costingMethods)[number];
export type QuotationStatus = (typeof quotationStatuses)[number];
export type CostingDocumentType = (typeof costingDocumentTypes)[number];
export type CostingSourceType = (typeof costingSourceTypes)[number];
export type CostingSourceStatus = (typeof costingSourceStatuses)[number];
export type WorkCategory = (typeof workCategories)[number];

export const recommendedWorkCategoriesByProjectType: Record<
  ProjectType,
  readonly WorkCategory[]
> = {
  Fixtures: ["Fixtures", "Metal Fixtures"],
  SIS: [
    "Fixtures",
    "Metal Fixtures",
    "Signage / Branding",
    "Installation",
    "Logistics",
  ],
  Turnkey: workCategories,
  Civil: [
    "Civil",
    "Electrical",
    "HVAC",
    "Fire",
    "MEP",
    "Flooring",
    "Ceiling",
    "Painting",
    "Plumbing",
    "Installation",
    "Logistics",
    "Other",
  ],
};

export type CostingSummary = {
  projectJobCode: string;
  costingStatus: CostingStatus;
  costingOwner: string;
  costingMethod: CostingMethod;
  finalInternalCost: string;
  currentQuotationAmount: string;
  currentQuotationVersion: string;
  quotationStatus: QuotationStatus;
  lastUpdated: string;
};

export type CostingDocument = {
  id: string;
  projectJobCode: string;
  type: CostingDocumentType;
  name: string;
  url: string;
  addedBy: string;
  addedDate: string;
  version: string;
  notes: string;
};

export type CostingSource = {
  sourceId: string;
  projectJobCode: string;
  sourceType: CostingSourceType;
  workCategories: WorkCategory[];
  sourceName: string;
  status: CostingSourceStatus;
  costingLink: string;
  amount: string;
  requiredBy: string;
  receivedDate: string;
  notes: string;
};

export type QuotationVersion = {
  quotationId: string;
  projectJobCode: string;
  version: string;
  amount: string;
  quotationLink: string;
  status: QuotationStatus;
  createdDate: string;
  sentDate: string;
  notes: string;
};

export type CommercialNote = {
  id: string;
  projectJobCode: string;
  date: string;
  note: string;
};

export type CostingWorkspaceData = {
  summary: CostingSummary;
  documents: CostingDocument[];
  sources: CostingSource[];
  quotations: QuotationVersion[];
  notes: CommercialNote[];
};

const placeholderSheetUrl = "https://docs.google.com/spreadsheets/";
const placeholderDocumentUrl = "https://docs.google.com/document/";

export const costingWorkspaceByJobCode: Record<string, CostingWorkspaceData> = {
  GDS149: {
    summary: {
      projectJobCode: "GDS149",
      costingStatus: "Costing Approved",
      costingOwner: "Sachin",
      costingMethod: "Internal Production",
      finalInternalCost: "₹720,000",
      currentQuotationAmount: "₹930,000",
      currentQuotationVersion: "V1",
      quotationStatus: "Sent to Client",
      lastUpdated: "2026-08-21T09:30:00Z",
    },
    documents: [
      {
        id: "DOC-149-01",
        projectJobCode: "GDS149",
        type: "Client BOQ",
        name: "Fictional client BOQ",
        url: placeholderSheetUrl,
        addedBy: "Sachin",
        addedDate: "2026-08-12",
        version: "V1",
        notes: "Prototype link only.",
      },
      {
        id: "DOC-149-02",
        projectJobCode: "GDS149",
        type: "Quotation",
        name: "Fictional quotation",
        url: placeholderDocumentUrl,
        addedBy: "Sachin",
        addedDate: "2026-08-20",
        version: "V1",
        notes: "Prototype link only.",
      },
    ],
    sources: [
      {
        sourceId: "SRC-149-01",
        projectJobCode: "GDS149",
        sourceType: "Internal Production",
        workCategories: ["Fixtures", "Metal Fixtures"],
        sourceName: "GDS Factory",
        status: "Approved",
        costingLink: placeholderSheetUrl,
        amount: "₹720,000",
        requiredBy: "2026-08-16",
        receivedDate: "2026-08-15",
        notes: "Fictional internal costing source.",
      },
    ],
    quotations: [
      {
        quotationId: "QUO-149-01",
        projectJobCode: "GDS149",
        version: "V1",
        amount: "₹930,000",
        quotationLink: placeholderDocumentUrl,
        status: "Sent to Client",
        createdDate: "2026-08-19",
        sentDate: "2026-08-20",
        notes: "Fictional quotation version.",
      },
    ],
    notes: [
      {
        id: "NOTE-149-01",
        projectJobCode: "GDS149",
        date: "2026-08-20",
        note: "Final quotation shared.",
      },
    ],
  },
  GDS150: {
    summary: {
      projectJobCode: "GDS150",
      costingStatus: "Under Negotiation",
      costingOwner: "Neeraj",
      costingMethod: "Internal Production",
      finalInternalCost: "₹845,000",
      currentQuotationAmount: "₹1,040,000",
      currentQuotationVersion: "V2",
      quotationStatus: "Under Negotiation",
      lastUpdated: "2026-08-25T11:15:00Z",
    },
    documents: [
      {
        id: "DOC-150-01",
        projectJobCode: "GDS150",
        type: "Client BOQ",
        name: "Fictional client requirement BOQ",
        url: placeholderSheetUrl,
        addedBy: "Neeraj",
        addedDate: "2026-08-05",
        version: "V1",
        notes: "Prototype link only.",
      },
      {
        id: "DOC-150-02",
        projectJobCode: "GDS150",
        type: "Final Costing",
        name: "Fictional consolidated costing",
        url: placeholderSheetUrl,
        addedBy: "Neeraj",
        addedDate: "2026-08-18",
        version: "V2",
        notes: "Fictional internal production costing.",
      },
      {
        id: "DOC-150-03",
        projectJobCode: "GDS150",
        type: "Revised Quotation",
        name: "Fictional revised quotation",
        url: placeholderDocumentUrl,
        addedBy: "Neeraj",
        addedDate: "2026-08-24",
        version: "V2",
        notes: "Prototype link only.",
      },
    ],
    sources: [
      {
        sourceId: "SRC-150-01",
        projectJobCode: "GDS150",
        sourceType: "Internal Production",
        workCategories: ["Fixtures", "Metal Fixtures"],
        sourceName: "GDS Factory",
        status: "Received",
        costingLink: placeholderSheetUrl,
        amount: "₹845,000",
        requiredBy: "2026-08-14",
        receivedDate: "2026-08-13",
        notes: "Fictional internal costing source.",
      },
    ],
    quotations: [
      {
        quotationId: "QUO-150-01",
        projectJobCode: "GDS150",
        version: "V1",
        amount: "₹1,075,000",
        quotationLink: placeholderDocumentUrl,
        status: "Sent to Client",
        createdDate: "2026-08-19",
        sentDate: "2026-08-20",
        notes: "Initial fictional quotation.",
      },
      {
        quotationId: "QUO-150-02",
        projectJobCode: "GDS150",
        version: "V2",
        amount: "₹1,040,000",
        quotationLink: placeholderDocumentUrl,
        status: "Under Negotiation",
        createdDate: "2026-08-24",
        sentDate: "2026-08-24",
        notes: "Fictional revised quotation.",
      },
    ],
    notes: [
      {
        id: "NOTE-150-01",
        projectJobCode: "GDS150",
        date: "2026-08-21",
        note: "Client requested revised rate.",
      },
      {
        id: "NOTE-150-02",
        projectJobCode: "GDS150",
        date: "2026-08-23",
        note: "Internal production costing updated.",
      },
      {
        id: "NOTE-150-03",
        projectJobCode: "GDS150",
        date: "2026-08-24",
        note: "Final quotation shared.",
      },
    ],
  },
};
