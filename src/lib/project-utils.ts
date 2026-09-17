export type ProjectListItem = {
  financialYear: string;
  jobCode: string;
  projectName: string;
  brand: string;
  projectType: string;
  projectLead: string;
  projectManager: string;
  status: string;
  routeKey?: string;
  source?: "persistent" | "demo";
  lifecycleState?: string;
};

export type ProjectFilters = {
  search: string;
  brand: string;
  lead: string;
  manager: string;
  type: string;
  status: string;
};

export function filterProjects(
  projects: ProjectListItem[],
  filters: ProjectFilters,
) {
  const query = filters.search.trim().toLowerCase();
  return projects.filter((project) => {
    const matchesSearch =
      !query ||
      project.jobCode.toLowerCase().includes(query) ||
      project.projectName.toLowerCase().includes(query);
    return (
      matchesSearch &&
      (!filters.brand || project.brand === filters.brand) &&
      (!filters.lead || project.projectLead === filters.lead) &&
      (!filters.manager || project.projectManager === filters.manager) &&
      (!filters.type || project.projectType === filters.type) &&
      (!filters.status || project.status === filters.status)
    );
  });
}

export const projectFieldNames = [
  "jobCode",
  "projectName",
  "brand",
  "projectType",
  "projectLead",
  "projectManager",
  "address",
  "sitePocName",
  "sitePocEmail",
  "sitePocPhone",
  "status",
] as const;

export type ProjectFormValues = Record<
  (typeof projectFieldNames)[number],
  string
>;

export function validatePrototypeProject(values: ProjectFormValues) {
  return Object.fromEntries(
    projectFieldNames
      .filter((field) => !values[field].trim())
      .map((field) => [field, "Required for activation"]),
  );
}
