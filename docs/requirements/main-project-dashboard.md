# Main Project Dashboard

## Main navigation

The ERP landing page has three primary actions:

1. Create New Project
2. Active Projects
3. Archived Projects

## Project identity and Job Code

- One project record represents one GDS Job Code within a financial year.
- GDS Job Codes reset at the beginning of every Indian financial year.
- The current financial year is FY 2026-27.
- The highest existing code for FY 2026-27 is GDS150.
- The next generated prototype code is GDS151.
- A new financial year begins from GDS001.
- The real unique identity will eventually be financial year plus Job Code.
- Job Code is generated and cannot be manually edited in the Create Project form.
- The prototype displays GDS151 as a generated, read-only value.
- The production system will reserve the code when the first Draft is saved.
- The prototype does not implement database sequence generation.
- Project Lead is either Achint or Ikjot.

## Project creation

The Create Project form contains:

1. GDS Job Code — generated and read-only
2. Project Name
3. Brand
4. Project Type
5. Project Lead
6. Project Manager
7. Address and City
8. Site POC Name
9. Site POC Email
10. Site POC Phone
11. Project Status

- All fields are mandatory for activation.
- An incomplete project may be saved as Draft.
- Draft projects do not appear in Active Projects.
- A project enters Active Projects only after all mandatory fields are completed and submitted.
- Brand remains a text field in the prototype and will later become searchable/selectable.
- The final Project Manager list remains unresolved; prototype values must be clearly labelled.

## Approved Project Types

- Civil
- Turnkey
- Fixtures

## Approved Project Statuses

Project Status is manually selected from:

1. PO Received
2. Project Planning
3. Design in Progress
4. In Production
5. Installation
6. Measurement
7. Handover
8. Billing
9. Payment

## Active Projects dashboard

One row represents one GDS Job Code.

The dashboard displays only:

- GDS Job Code
- Project Name
- Brand
- Project Type
- Project Lead
- Project Manager
- Project Status

- Project Name is the primary clickable link to the Project Overview.
- Address, Site POC, and contact information do not appear in the table.
- Search covers GDS Job Code and Project Name only.
- Filters are provided for Brand, Project Type, Project Lead, Project Manager, and Project Status.
- Detailed internal information is not required in the dashboard table.

## Project Overview

Clicking a Project Name opens a Project Overview displaying:

- Financial Year
- GDS Job Code
- Project Name
- Brand
- Project Type
- Project Lead
- Project Manager
- Project Status
- Address and City
- Site POC Name
- Site POC Email
- Site POC Phone

Below the overview, a restrained placeholder indicates that the detailed project progression workflow will be designed next.

Do not define workflow stages, department tabs, financial information, document sections, or closure sections beyond the approved overview.

## Prototype boundary

The initial visual prototype includes:

- Landing page
- Create Project form
- Active Projects dashboard
- Archived Projects placeholder
- Basic Project Overview

The prototype:

- Uses fictional mock data only.
- Has no database or persistence.
- Has no authentication.
- Has no API.
- Has no Google Drive integration.
- Has no production deployment.
- Does not implement financial calculations.
- Does not implement database sequence generation.
- Does not invent future project progression or internal project sections.

