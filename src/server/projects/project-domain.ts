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

export const projectLifecycles = [
  "Draft",
  "Active",
  "Archived",
  "Closed",
] as const;

export type ProjectType = (typeof approvedProjectTypes)[number];
export type ProjectStatus = (typeof approvedProjectStatuses)[number];
export type ProjectLifecycle = (typeof projectLifecycles)[number];

export type ProjectDraft = {
  id: string;
  financialYearId: string;
  jobCode: string;
  projectName: string | null;
  brand: string | null;
  projectType: ProjectType | null;
  leadUserId: string | null;
  projectManagerUserId: string | null;
  createdByUserId: string;
  projectStatus: ProjectStatus;
  lifecycleState: ProjectLifecycle;
  siteAddress: string | null;
  city: string | null;
  clientPocName: string | null;
  clientPocEmail: string | null;
  clientPocPhone: string | null;
  notes: string | null;
  activatedAt: Date | null;
};

export type CreateProjectDraftInput = {
  effectiveDate?: string;
  createdByUserId: string;
  projectName?: string | null;
  brand?: string | null;
  projectType?: ProjectType | null;
  leadUserId?: string | null;
  projectManagerUserId?: string | null;
  projectStatus?: ProjectStatus;
  siteAddress?: string | null;
  city?: string | null;
  clientPocName?: string | null;
  clientPocEmail?: string | null;
  clientPocPhone?: string | null;
  notes?: string | null;
};

export const activationFieldLabels = {
  jobCode: "Job Code",
  projectName: "Project Name",
  brand: "Brand",
  projectType: "Project Type",
  leadUserId: "Project Lead",
  projectManagerUserId: "Project Manager",
  projectStatus: "Project Status",
} as const;

export type ActivationField = keyof typeof activationFieldLabels;

export function formatJobCode(sequenceNumber: number) {
  if (!Number.isSafeInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error("Job Code sequence number must be a positive integer.");
  }

  return `GDS${String(sequenceNumber).padStart(3, "0")}`;
}

export function getMissingActivationFields(project: ProjectDraft) {
  return (Object.keys(activationFieldLabels) as ActivationField[]).filter(
    (field) => {
      const value = project[field];
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      );
    },
  );
}

export class ProjectActivationError extends Error {
  constructor(readonly missingFields: ActivationField[]) {
    super(
      `Project activation requires: ${missingFields
        .map((field) => activationFieldLabels[field])
        .join(", ")}.`,
    );
    this.name = "ProjectActivationError";
  }
}

export interface ProjectCreationStore {
  createDraftWithReservedJobCode(
    input: CreateProjectDraftInput,
  ): Promise<ProjectDraft>;
  findProjectById(projectId: string): Promise<ProjectDraft | null>;
  activateDraft(projectId: string, activatedAt: Date): Promise<ProjectDraft>;
}

export function createProjectCreationService(store: ProjectCreationStore) {
  return {
    createFirstDraft(input: CreateProjectDraftInput) {
      return store.createDraftWithReservedJobCode(input);
    },

    async activateDraft(projectId: string) {
      const project = await store.findProjectById(projectId);
      if (!project) throw new Error("Project Draft was not found.");
      if (project.lifecycleState !== "Draft") {
        throw new Error("Only a Draft project can be activated.");
      }

      const missingFields = getMissingActivationFields(project);
      if (missingFields.length > 0) {
        throw new ProjectActivationError(missingFields);
      }

      return store.activateDraft(projectId, new Date());
    },
  };
}
