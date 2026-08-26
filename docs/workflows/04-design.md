# Design Workflow

## Approved V1 scope

- Design work may occur before or after PO.
- Project Status, Design Task Status, and Client Response Status are independent.
- One Design Task represents one specific Design Version.
- Completed versions are not reopened; client-requested changes create the next version.
- Historical versions remain visible.
- Project Overview contains only a compact Design summary. Full management remains in the `Design` section.
- Prototype interactions use local state and are not persisted.

## Design Task information

Each task records:

- ID, GDS Job Code, Design Type, and Task Name
- Assigned To, Assigned By, Assigned Date, and Due Date
- Completed Date and Submitted Date as separate fields
- Task Status, Client Response Status, and Priority
- Drawing link, Version, previous-version relationship, and Notes

Approved Design Types are 2D, 3D, MEP, HVAC, Production Drawing, Revision, and Other. Multiple tasks may use the same Design Type.

Task Status represents internal work progress: Not Started, In Progress, Completed, or Closed.

Client Response Status is separate: Not Submitted, Waiting Client, Approved, or Revision Requested.

Approved priorities are Normal, High, and Urgent.

## Completion and submission

- A Drawing / Google Drive link is optional for Not Started and In Progress tasks.
- A drawing link is required when marking a task Completed.
- Completion records Completed Date but does not automatically close the version.
- Submit to Client records Submitted Date, closes the task, and sets Client Response Status to Waiting Client.
- A waiting client response may be marked Approved or Revision Requested.
- Revision Requested preserves the closed version and enables creation of V2, V3, or the next sequential version.
- A new version copies its design context and prior assignees, requires new Assigned and Due dates, links to the prior task, and resets completion, submission, drawing, and client-response information.

## Date and health behaviour

- Overdue health applies only to active Not Started and In Progress tasks.
- Completed and Closed tasks are not treated as overdue.
- Waiting Client is represented through Client Response Status and does not create production-task overdue warnings.
- Client-response ageing is deferred.

## V1 boundary

- Drawings remain in Google Drive; the ERP stores manually entered links.
- File uploads, Google APIs, persistence, notifications, approval hierarchy, employee authentication, and automatic Project Status changes are not implemented.
- Project Type does not automatically generate or restrict Design Tasks.
- Placeholders and fictional prototype records are not approved GDS business rules.
