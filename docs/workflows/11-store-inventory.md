# Store / Inventory V1

## Flow

Material Requirement → Store Stock Check → Fully Available or Partial / Shortage → Allocation → Shortage to Purchase if required → Material Receipt → Material Issue → Request Closed

## Ownership

- Production, Project Managers, Site Execution or Management create the material requirement.
- Store checks stock, allocates availability, records physical receipts and issues material.
- Purchase sources shortages and external material through its existing workflow.
- Detailed requirement sheets remain external in Google Drive or Google Sheets.

## Scope

- Inventory records operational on-hand quantities and a simple storage location.
- Allocation derives shortage and remaining allocated quantity.
- Receipts increase local Store stock; issues reduce it and cannot exceed remaining allocation.
- The Create Purchase Request action is a prototype handoff only. Automatic creation and live cross-tab synchronization are deferred.

## Deferred

- Accounting inventory and stock valuation
- Vendor Master
- Barcode or QR tracking
- Warehouse, bin and rack hierarchy
- Automatic Purchase creation
- Persistence and live cross-tab synchronization
- Tally integration
