export const approvedProjectTypes = ["Civil", "Turnkey", "Fixtures"] as const;

export const approvedProjectStatuses = [
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

// The final Project Manager list is unresolved. These names are fictional and prototype-only.
export const prototypeProjectManagers = [
  "Prototype Manager A",
  "Prototype Manager B",
  "Prototype Manager C",
] as const;

export const currentFinancialYear = "FY 2026-27";
export const nextPrototypeJobCode = "GDS151";

export type Project = {
  financialYear: string;
  jobCode: string;
  projectName: string;
  brand: string;
  projectType: (typeof approvedProjectTypes)[number];
  projectLead: (typeof projectLeads)[number];
  projectManager: string;
  address: string;
  sitePocName: string;
  sitePocEmail: string;
  sitePocPhone: string;
  status: (typeof approvedProjectStatuses)[number];
};

export const activeProjects: Project[] = [
  {
    financialYear: currentFinancialYear,
    jobCode: "GDS145",
    projectName: "Northstar Display Refresh",
    brand: "Fictional Northstar",
    projectType: "Civil",
    projectLead: "Achint",
    projectManager: prototypeProjectManagers[0],
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
    projectManager: prototypeProjectManagers[1],
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
    projectManager: prototypeProjectManagers[2],
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
    projectManager: prototypeProjectManagers[0],
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
    projectManager: prototypeProjectManagers[1],
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
    projectManager: prototypeProjectManagers[2],
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
