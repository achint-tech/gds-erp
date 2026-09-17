import { PageHeading } from "@/components/page-heading";
import { ProjectForm } from "@/components/project-form";
import { getProjectFormOptions } from "@/server/projects/project-service";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  let options;
  try {
    options = await getProjectFormOptions();
  } catch {
    options = null;
  }

  return (
    <>
      <PageHeading
        eyebrow="Projects / Create"
        title="Create New Project"
        description="Enter the initial information and save a persistent Draft. The database assigns the Job Code on first save."
      />
      {options ? (
        <ProjectForm {...options} />
      ) : (
        <section className="panel p-6" role="alert">
          <h2 className="font-bold text-red-900">Project form unavailable</h2>
          <p className="mt-2 text-sm text-slate-600">
            Internal users could not be loaded. No Draft or Job Code was
            created. Please retry after the database connection is available.
          </p>
        </section>
      )}
    </>
  );
}
