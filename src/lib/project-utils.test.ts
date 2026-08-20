import { describe, expect, it } from "vitest";
import { activeProjects } from "./prototype-data";
import {
  filterProjects,
  projectFieldNames,
  validatePrototypeProject,
  type ProjectFormValues,
} from "./project-utils";

const emptyFilters = {
  search: "",
  brand: "",
  lead: "",
  manager: "",
  type: "",
  status: "",
};

describe("filterProjects", () => {
  it("searches by GDS Job Code", () => {
    expect(
      filterProjects(activeProjects, { ...emptyFilters, search: "GDS150" }).map(
        (project) => project.jobCode,
      ),
    ).toEqual(["GDS150"]);
  });

  it("searches by Project Name", () => {
    expect(
      filterProjects(activeProjects, {
        ...emptyFilters,
        search: "northstar",
      }).map((project) => project.jobCode),
    ).toEqual(["GDS145"]);
  });

  it("does not search non-approved fields", () => {
    expect(
      filterProjects(activeProjects, {
        ...emptyFilters,
        search: "Fictional Northstar",
      }),
    ).toHaveLength(0);
  });

  it("filters by an approved Project Type", () => {
    expect(
      filterProjects(activeProjects, {
        ...emptyFilters,
        type: "Fixtures",
      }).every((project) => project.projectType === "Fixtures"),
    ).toBe(true);
  });

  it("filters by an approved Project Status", () => {
    expect(
      filterProjects(activeProjects, {
        ...emptyFilters,
        status: "Installation",
      }).map((project) => project.jobCode),
    ).toEqual(["GDS149"]);
  });
});

describe("validatePrototypeProject", () => {
  it("requires every activation field", () => {
    const blankValues = Object.fromEntries(
      projectFieldNames.map((field) => [field, ""]),
    ) as ProjectFormValues;
    expect(Object.keys(validatePrototypeProject(blankValues))).toEqual([
      ...projectFieldNames,
    ]);
  });

  it("accepts all completed activation fields", () => {
    const completeValues = Object.fromEntries(
      projectFieldNames.map((field) => [field, `Value for ${field}`]),
    ) as ProjectFormValues;
    expect(validatePrototypeProject(completeValues)).toEqual({});
  });
});
