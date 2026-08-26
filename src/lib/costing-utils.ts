import {
  recommendedWorkCategoriesByProjectType,
  workCategories,
  type ProjectType,
} from "./prototype-data";

export function hasRequiredUrl(value: string) {
  return value.trim().length > 0;
}

export function displayValue(value: string) {
  return value.trim() || "—";
}

export function hasWorkCategorySelection(values: readonly string[]) {
  return values.length > 0;
}

export function getRecommendedWorkCategories(projectType: ProjectType) {
  return recommendedWorkCategoriesByProjectType[projectType];
}

export function getAdditionalWorkCategories(projectType: ProjectType) {
  const recommended = new Set(getRecommendedWorkCategories(projectType));
  return workCategories.filter((category) => !recommended.has(category));
}
