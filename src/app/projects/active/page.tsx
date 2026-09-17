import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { ProjectsTable } from "@/components/projects-table";
import { activeProjects } from "@/lib/prototype-data";
import type { ProjectListItem } from "@/lib/project-utils";
import { listPersistedProjects } from "@/server/projects/project-service";

export const dynamic = "force-dynamic";

const demoProjects: ProjectListItem[] = activeProjects.map((project) => ({
  ...project,
  routeKey: project.jobCode,
  source: "demo",
}));

export default async function ActiveProjectsPage() {
  let persistentProjects: ProjectListItem[] = [];
  let loadFailed = false;
  try {
    persistentProjects = (await listPersistedProjects()).map((project) => ({
      financialYear: project.financialYear,
      jobCode: project.jobCode,
      projectName: project.projectName || "Untitled Draft",
      brand: project.brand || "—",
      projectType: project.projectType || "—",
      projectLead: project.projectLead || "—",
      projectManager: project.projectManager || "—",
      status: project.projectStatus,
      routeKey: project.id,
      source: "persistent",
      lifecycleState: project.lifecycleState,
    }));
  } catch {
    loadFailed = true;
  }

  return (
    <>
      <PageHeading
        eyebrow="Projects"
        title="Active Projects"
        description="Saved database projects are shown alongside clearly labelled legacy demo records during this transition."
        action={
          <Link className="button button-primary" href="/projects/new">
            Create New Project
          </Link>
        }
      />
      {loadFailed && (
        <div
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          Saved projects could not be loaded. Demo records remain available;
          retry when the database connection is restored.
        </div>
      )}
      <ProjectsTable projects={[...persistentProjects, ...demoProjects]} />
    </>
  );
}
