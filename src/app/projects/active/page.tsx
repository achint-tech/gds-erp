import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { ProjectsTable } from "@/components/projects-table";
import { activeProjects } from "@/lib/prototype-data";

export default function ActiveProjectsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Projects"
        title="Active Projects"
        description="One row represents one GDS Job Code. Select a fictional Project Name to open its basic overview."
        action={
          <Link className="button button-primary" href="/projects/new">
            Create New Project
          </Link>
        }
      />
      <ProjectsTable projects={activeProjects} />
    </>
  );
}
