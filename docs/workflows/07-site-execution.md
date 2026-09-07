# Site Execution V1

## Flow

Project and PO context → Recce / Site Start → Work Package Execution → Fixture Receipt / Installation when applicable → Site QC → Rectification if required → Handover

## Scope

- Site Execution is managed within the project workspace.
- Project and available PO context is inherited and read-only.
- Project managers select only applicable work packages and maintain ownership, dates, status, delays, notes and chronological progress updates.
- Fixture dispatched quantities are inherited from Production; site receipt, installation and pending quantities support partial movement.
- Site QC records a lightweight decision and rectification summary rather than individual snag items.
- Handover is manually confirmed and visually completes Site Execution.

## Derived information

- Deadline health and days delayed come from the target Site completion date.
- Pending installation and installation percentage come from received and installed quantities.
- Rectification and handover completion are surfaced automatically from their recorded states.

## Boundaries

- Production remains separate, and Dispatch stays inside Production.
- A Vendor Work Order workflow is future and separate.
- A separate Logistics or Site module is not included.
- Measurement, Billing and Payment are future and separate.
- Prototype changes are local only and are not persisted.
