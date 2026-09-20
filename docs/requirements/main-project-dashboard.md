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
- Approved Project Managers are Anumeha, Sachin, and Neeraj.

## Approved Project Types

- Civil
- SIS
- Turnkey
- Fixtures

## Approved Project Statuses

Project Status is manually selected from:

1. Quotation
2. PO Received
3. Project Planning
4. Design in Progress
5. In Production
6. Installation
7. Measurement
8. Handover
9. Billing
10. Payment

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

## Costing & Quotation

- The Project Overview includes a `Costing & Quotation` section for the approved Pre-PO commercial workflow.
- Costing calculations remain in existing Google Sheets for V1.
- GDS ERP stores one editable requirement/BOQ summary per project, multiple costing entries, and versioned quotation history. Detailed calculations and documents remain in Google Drive or Google Sheets.
- Google Sheet and Google Drive documents are represented by manually entered URLs only.
- A project may use Internal Production, an External Vendor, or both as costing sources.
- A project may have multiple vendor costing sources.
- A Costing Source may cover one or more Work Categories.
- Multiple costing sources may cover the same Work Category, and internal and vendor costing may coexist for the same category.
- The workspace displays costing status, active costing-entry count, recorded costing amount, latest quotation, and final quotation value.
- Recorded costing amount excludes cancelled entries and must not be presented as final project cost.
- Quotation versions are server-assigned per project; submitted and final commercial history is preserved.
- The full Costing & Quotation workspace is displayed only within its dedicated project section. Project Overview contains only a compact commercial summary.
- Project Type determines the default/recommended Costing Work Categories presented in the UI. The underlying costing model remains flexible, and additional categories may be added when required.
- Prototype additions use local React state and are not persisted.
- Native costing calculations and document attachment features are deferred.
- PO-to-project conversion is deferred.
- Margin calculations, costing formulas, quotation generation, approvals, notifications, and email sending are not part of this workflow.

## Purchase Order information

- V1 PO information consists of PO Number, PO Date, PO Amount, PO Document Link, PO Notes, and Added Date.
- A project may have zero, one, or many Client POs.
- Active Client POs contribute to the derived Total PO Value.
- Cancelled Client POs remain visible but do not contribute to the total.
- Active Client POs may be edited for data-entry corrections or cancelled; saved POs are not hard-deleted through the normal UI.
- Project documents continue to be stored in Google Drive for V1; the ERP stores manually entered links.
- Project Overview displays the Client PO records, Active PO count, derived Total PO Value, or a restrained empty state.
- File uploads, Google Drive integration, PO parsing, OCR, accounting integration, automatic PO validation, and automatic project conversion are deferred.

## Design

- Design may occur before or after PO.
- Project Status and Design Task Status are independent.
- Design Tasks track Assigned Date, Due Date, and Completed Date as separate fields.
- One Design Task represents one Design Version, and historical versions remain intact.
- Completed Date and Submitted Date are separate.
- Design Task Status and Client Response Status are independent.
- A drawing link is required to complete a Design Task.
- Submitting a completed version closes it and records that it is waiting for the client.
- Approved responses retain the version; requested revisions create the next sequential version.
- Incomplete Design Tasks are automatically highlighted from their Due Date.
- Project Overview contains only a compact Design summary.
- Full Design management is displayed only in the dedicated `Design` project section.
- Design is not hidden or automatically completed based on Project Status.

## Purchase Workflow

- The dedicated `Purchase` project section manages material, product, and item procurement only.
- Execution subcontractors and vendor work orders are outside Purchase V1.
- Project Overview contains only a compact Purchase summary.
- Detailed material and item lists remain in Excel or Google Sheets for V1; ERP stores the corresponding Drive or Sheet link instead of native line items.
- A Purchase Request may contain multiple supplier quotations.
- Rate comparisons, supporting documents, supplier quotations, supplier POs, and urgent-purchase screenshots remain manually entered Google Drive or Google Sheets links.
- Purchase Recommendation is not part of V1. After sourcing and optional rate comparison, requests proceed directly to Management Approval.
- Management provides final Purchase approval; approval thresholds are not yet defined.
- Supplier POs may record advance or credit dependencies without processing payments.
- Delivery records receipt condition and may move an affected request to Replacement Pending.
- Additional requirements after PO Issued create a new, optionally related Purchase Request.
- Urgent Purchase is a lightweight local-prototype exception.
- The Purchase Department dashboard provides a fictional cross-project view without authentication.

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
