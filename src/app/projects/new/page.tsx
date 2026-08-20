import { PageHeading } from "@/components/page-heading";
import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <>
      <PageHeading
        eyebrow="Projects / Create"
        title="Create New Project"
        description="Enter the initial information for one GDS Job Code. This form demonstrates local-only draft and validation behaviour."
      />
      <ProjectForm />
    </>
  );
}
