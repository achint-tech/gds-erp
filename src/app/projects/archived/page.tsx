import { PageHeading } from "@/components/page-heading";
import { ProjectsTable } from "@/components/projects-table";
import { archivedProjects } from "@/lib/prototype-data";

export default function ArchivedProjectsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Projects"
        title="Archived Projects"
        description="A visual placeholder for finding archived project records. Archive behaviour has not been specified."
      />
      <ProjectsTable projects={archivedProjects} archived />
    </>
  );
}
