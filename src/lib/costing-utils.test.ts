import { describe, expect, it } from "vitest";
import {
  displayValue,
  getAdditionalWorkCategories,
  getRecommendedWorkCategories,
  hasRequiredUrl,
  hasWorkCategorySelection,
} from "./costing-utils";

describe("hasRequiredUrl", () => {
  it("rejects an empty or whitespace-only document URL", () => {
    expect(hasRequiredUrl("")).toBe(false);
    expect(hasRequiredUrl("   ")).toBe(false);
  });

  it("accepts a manually entered document URL", () => {
    expect(hasRequiredUrl("https://docs.google.com/spreadsheets/")).toBe(true);
  });
});

describe("displayValue", () => {
  it("uses a restrained placeholder for missing prototype values", () => {
    expect(displayValue("")).toBe("—");
  });
});

describe("hasWorkCategorySelection", () => {
  it("requires at least one Work Category", () => {
    expect(hasWorkCategorySelection([])).toBe(false);
    expect(hasWorkCategorySelection(["HVAC", "Fire"])).toBe(true);
  });
});

describe("Project Type Work Category recommendations", () => {
  it("keeps Fixtures compact by default while allowing more categories", () => {
    expect(getRecommendedWorkCategories("Fixtures")).toEqual([
      "Fixtures",
      "Metal Fixtures",
    ]);
    expect(getAdditionalWorkCategories("Fixtures")).toContain("Installation");
  });

  it("uses the approved SIS defaults", () => {
    expect(getRecommendedWorkCategories("SIS")).toEqual([
      "Fixtures",
      "Metal Fixtures",
      "Signage / Branding",
      "Installation",
      "Logistics",
    ]);
  });

  it("shows the full set for Turnkey", () => {
    expect(getAdditionalWorkCategories("Turnkey")).toEqual([]);
  });

  it("keeps fixture categories additional for Civil", () => {
    expect(getRecommendedWorkCategories("Civil")).not.toContain("Fixtures");
    expect(getAdditionalWorkCategories("Civil")).toEqual([
      "Fixtures",
      "Metal Fixtures",
      "Signage / Branding",
    ]);
  });
});
