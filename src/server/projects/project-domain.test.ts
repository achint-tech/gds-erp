import { describe, expect, it } from "vitest";
import {
  classifyProjectUsers,
  createProjectCreationService,
  formatJobCode,
  ProjectActivationError,
  type CreateProjectDraftInput,
  type ProjectCreationStore,
  type ProjectDraft,
} from "./project-domain";

type TestFinancialYear = {
  id: string;
  startsOn: string;
  endsOn: string;
  nextJobNumber: number;
};

class MemoryProjectStore implements ProjectCreationStore {
  private projects = new Map<string, ProjectDraft>();
  private nextId = 1;
  private queue = Promise.resolve();

  constructor(private financialYears: TestFinancialYear[]) {}

  private async exclusively<T>(operation: () => T | Promise<T>) {
    const previous = this.queue;
    let release: () => void = () => undefined;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  createDraftWithReservedJobCode(input: CreateProjectDraftInput) {
    return this.exclusively(() => {
      const effectiveDate = input.effectiveDate ?? "2026-09-16";
      const financialYear = this.financialYears.find(
        (year) =>
          year.startsOn <= effectiveDate && year.endsOn >= effectiveDate,
      );
      if (!financialYear) throw new Error("Financial Year not found.");

      const jobCode = formatJobCode(financialYear.nextJobNumber);
      financialYear.nextJobNumber += 1;
      this.assertUnique(financialYear.id, jobCode);

      const project: ProjectDraft = {
        id: `project-${this.nextId++}`,
        financialYearId: financialYear.id,
        jobCode,
        projectName: input.projectName ?? null,
        brand: input.brand ?? null,
        projectType: input.projectType ?? null,
        leadUserId: input.leadUserId ?? null,
        projectManagerUserId: input.projectManagerUserId ?? null,
        createdByUserId: input.createdByUserId,
        projectStatus: input.projectStatus ?? "Quotation",
        lifecycleState: "Draft",
        siteAddress: input.siteAddress ?? null,
        city: input.city ?? null,
        clientPocName: input.clientPocName ?? null,
        clientPocEmail: input.clientPocEmail ?? null,
        clientPocPhone: input.clientPocPhone ?? null,
        notes: input.notes ?? null,
        activatedAt: null,
      };
      this.projects.set(project.id, project);
      return project;
    });
  }

  async findProjectById(projectId: string) {
    return this.projects.get(projectId) ?? null;
  }

  async updateDraft(
    projectId: string,
    input: Omit<CreateProjectDraftInput, "createdByUserId" | "effectiveDate">,
  ) {
    const existing = this.projects.get(projectId);
    if (!existing) throw new Error("Project not found.");
    const updated = {
      ...existing,
      ...input,
      projectStatus: input.projectStatus ?? existing.projectStatus,
    };
    this.projects.set(projectId, updated);
    return updated;
  }

  async activateDraft(projectId: string, activatedAt: Date) {
    const existing = this.projects.get(projectId);
    if (!existing) throw new Error("Project not found.");
    const active = {
      ...existing,
      lifecycleState: "Active" as const,
      activatedAt,
    };
    this.projects.set(projectId, active);
    return active;
  }

  delete(projectId: string) {
    this.projects.delete(projectId);
  }

  get size() {
    return this.projects.size;
  }

  insertForConstraintTest(project: ProjectDraft) {
    this.assertUnique(project.financialYearId, project.jobCode);
    this.projects.set(project.id, project);
  }

  private assertUnique(financialYearId: string, jobCode: string) {
    const duplicate = [...this.projects.values()].some(
      (project) =>
        project.financialYearId === financialYearId &&
        project.jobCode === jobCode,
    );
    if (duplicate) throw new Error("Duplicate Financial Year + Job Code.");
  }
}

const currentYear = () => ({
  id: "fy-2026",
  startsOn: "2026-04-01",
  endsOn: "2027-03-31",
  nextJobNumber: 151,
});

const nextYear = () => ({
  id: "fy-2027",
  startsOn: "2027-04-01",
  endsOn: "2028-03-31",
  nextJobNumber: 1,
});

const completeInput: CreateProjectDraftInput = {
  effectiveDate: "2026-09-16",
  createdByUserId: "creator-user",
  projectName: "Test Project",
  brand: "Test Brand",
  projectType: "Fixtures",
  leadUserId: "lead-user",
  projectManagerUserId: "manager-user",
  projectStatus: "Quotation",
};

describe("persistent project foundation domain", () => {
  it("creates exactly one persisted project on first Save Draft", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    const service = createProjectCreationService(store);
    await service.saveDraft(completeInput);
    expect(store.size).toBe(1);
  });

  it("reserves GDS151 first and GDS152 next for FY 2026-27", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    expect((await service.createFirstDraft(completeInput)).jobCode).toBe(
      "GDS151",
    );
    expect((await service.createFirstDraft(completeInput)).jobCode).toBe(
      "GDS152",
    );
  });

  it("rejects duplicate Job Codes within one Financial Year", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    const project = await store.createDraftWithReservedJobCode(completeInput);
    expect(() =>
      store.insertForConstraintTest({ ...project, id: "duplicate" }),
    ).toThrow("Duplicate Financial Year + Job Code");
  });

  it("allows the same Job Code in different Financial Years", async () => {
    const store = new MemoryProjectStore([
      { ...currentYear(), nextJobNumber: 1 },
      nextYear(),
    ]);
    const first = await store.createDraftWithReservedJobCode({
      ...completeInput,
      effectiveDate: "2026-09-16",
    });
    const second = await store.createDraftWithReservedJobCode({
      ...completeInput,
      effectiveDate: "2027-09-16",
    });
    expect(first.jobCode).toBe("GDS001");
    expect(second.jobCode).toBe("GDS001");
  });

  it("starts a new Financial Year at GDS001", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([nextYear()]),
    );
    const project = await service.createFirstDraft({
      ...completeInput,
      effectiveDate: "2027-04-01",
    });
    expect(project.jobCode).toBe("GDS001");
  });

  it("does not reuse a reserved code after its Draft is deleted", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    const service = createProjectCreationService(store);
    const deleted = await service.createFirstDraft(completeInput);
    store.delete(deleted.id);
    expect((await service.createFirstDraft(completeInput)).jobCode).toBe(
      "GDS152",
    );
  });

  it("gives concurrent reservations different codes", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    const projects = await Promise.all([
      service.createFirstDraft(completeInput),
      service.createFirstDraft(completeInput),
    ]);
    expect(projects.map((project) => project.jobCode).sort()).toEqual([
      "GDS151",
      "GDS152",
    ]);
  });

  it("saves an incomplete Draft", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    const project = await service.createFirstDraft({
      createdByUserId: "creator-user",
    });
    expect(project.lifecycleState).toBe("Draft");
    expect(project.projectName).toBeNull();
    expect(project.projectStatus).toBe("Quotation");
  });

  it("rejects activation when required fields are missing", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    const project = await service.createFirstDraft({
      createdByUserId: "creator-user",
    });
    await expect(service.activateDraft(project.id)).rejects.toBeInstanceOf(
      ProjectActivationError,
    );
  });

  it("activates a complete Draft", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    const project = await service.createFirstDraft(completeInput);
    expect((await service.activateDraft(project.id)).lifecycleState).toBe(
      "Active",
    );
  });

  it("keeps Created By separate from Lead and Project Manager", async () => {
    const service = createProjectCreationService(
      new MemoryProjectStore([currentYear()]),
    );
    const project = await service.createFirstDraft(completeInput);
    expect(project.createdByUserId).toBe("creator-user");
    expect(project.createdByUserId).not.toBe(project.leadUserId);
    expect(project.createdByUserId).not.toBe(project.projectManagerUserId);
  });

  it("updates an existing Draft without reserving another Job Code", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    const service = createProjectCreationService(store);
    const firstSave = await service.saveDraft(completeInput);
    const secondSave = await service.saveDraft({
      ...completeInput,
      projectId: firstSave.id,
      projectName: "Updated Project",
    });
    expect(secondSave.id).toBe(firstSave.id);
    expect(secondSave.jobCode).toBe("GDS151");
    expect(secondSave.projectName).toBe("Updated Project");
    expect((await service.createFirstDraft(completeInput)).jobCode).toBe(
      "GDS152",
    );
  });

  it("reloads a persisted project through a fresh service read", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    const firstService = createProjectCreationService(store);
    const saved = await firstService.saveDraft(completeInput);
    const freshService = createProjectCreationService(store);
    const reloaded = await store.findProjectById(saved.id);
    expect(reloaded).toMatchObject({
      id: saved.id,
      jobCode: "GDS151",
      projectName: "Test Project",
    });
    expect(freshService).not.toBe(firstService);
  });

  it("classifies Lead and PM options from internal-user capabilities", () => {
    const options = classifyProjectUsers([
      {
        id: "both",
        displayName: "Multi Capability User",
        capabilities: ["project_lead", "project_manager"],
      },
      {
        id: "inactive-capability",
        displayName: "Manager",
        capabilities: ["project_manager"],
      },
    ]);
    expect(options.leads.map(({ id }) => id)).toEqual(["both"]);
    expect(options.projectManagers.map(({ id }) => id)).toEqual([
      "both",
      "inactive-capability",
    ]);
    expect(options.creators).toHaveLength(2);
  });

  it("propagates database errors without returning a fake saved project", async () => {
    const store = new MemoryProjectStore([currentYear()]);
    store.createDraftWithReservedJobCode = async () => {
      throw new Error("Database unavailable");
    };
    const service = createProjectCreationService(store);
    await expect(service.saveDraft(completeInput)).rejects.toThrow(
      "Database unavailable",
    );
  });
});
