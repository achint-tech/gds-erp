# Production Workflow V1

## Approved flow

Production planning
→ material readiness
→ manufacturing
→ QC
→ rework when required
→ packing
→ ready for dispatch
→ dispatched

## Fixture and batch tracking

- One Production record represents one fixture type or batch, not one physical unit.
- Required, completed, pending, and packed quantities are tracked per record.
- Completion percentage, packed-pending quantity, delayed days, and production health are derived automatically.
- Production ends at Ready for Dispatch or Dispatched; installation belongs to the future Site Execution workflow.

## Lightweight dispatch

- Dispatch remains the final lightweight stage inside Production V1; no separate Logistics module or route is created.
- One Dispatch record may contain multiple fixture types and quantities.
- Multiple Dispatch records support partial dispatches, split fixtures, and multiple destinations.
- Only Dispatched records count toward dispatched quantities. Draft and Cancelled records do not count.
- Drafts may be edited or deleted. A dispatched record is preserved and may only be cancelled with a reason and date.
- Cumulative dispatched quantity for a fixture cannot exceed its packed and QC-passed quantity.
- Site Execution begins after dispatch and site receipt and remains a future, separate workflow.

## Supporting information

- Drawing and material requirements remain manually entered Google Drive or Sheet links.
- Production processes are lightweight selections marked In-house or Outsourced and may run in parallel.
- Labour or taker information is recorded without payroll or payment processing.
- Delay reason and notes are surfaced when an incomplete record is overdue.

## QC and packing

- QC follows manufacturing and records checked, passed, and rework quantities with checklist and photo links.
- Any rework quantity surfaces Rework Required. After rework, a record may return to QC for re-check.
- When QC is passed and packing is complete, the fixture may become Ready for Dispatch.

## Deferred scope

- Store and Inventory are future, separate workflows.
- Detailed Logistics beyond this lightweight dispatch record is future and separate.
- Site installation and execution are future, separate workflows.
- The prototype has no persistence, database, authentication, uploads, integrations, notifications, or financial workflow.

Fictional mock records and placeholder values are not approved GDS business rules.
