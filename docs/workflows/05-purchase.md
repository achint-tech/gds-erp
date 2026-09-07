# Purchase Workflow V1

## Approved flow

Purchase Requirement
→ Purchase Department
→ Sourcing
→ Supplier Quotations
→ Rate Comparison if required
→ Management Approval
→ Supplier PO
→ Advance dependency if applicable
→ Awaiting Delivery
→ Material Received
→ Replacement if incorrect or damaged
→ Closed

## Scope

- Purchase applies only to materials, products, and items procured by GDS.
- Execution subcontractors and their work orders are outside this workflow.
- GDS may purchase materials used by external contractors.
- Requests may be raised by Project Managers, Production Manager, Site/Execution, or Management. Design does not raise Purchase Requests directly.
- Normal requirements go to the Purchase Department.
- Detailed material and item lists remain in Excel or Google Sheets for V1. ERP stores the corresponding Drive or Sheet link rather than recreating line-item purchasing.
- A request may contain multiple manually entered supplier quotations.
- Rate comparison is optional and remains a Google Sheet or Drive link.
- Purchase Recommendation is not part of the approved V1 workflow. After sourcing and optional rate comparison, a request proceeds directly to Management Approval.
- Supplier quotation statuses do not select or recommend a final supplier.
- The supplier recorded on the Supplier PO represents the final approved supplier.
- Final approval belongs to Management.
- Monetary approval thresholds are not defined.

## Supplier PO and delivery

- Supplier PO records payment type, optional advance or credit information, expected delivery, and a Google Drive link.
- Advance status only shows a dependency on Accounts; no Accounts workflow or payment processing is implemented.
- Receipt records actual date, receiver, and condition.
- Short, damaged, wrong, or incorrectly specified material may move to Replacement Pending with issue notes and an expected replacement date.
- Partial delivery tracking is deferred.

## Changes and exceptions

- Before PO Issued, an existing Purchase Request may be edited.
- After PO Issued, an additional requirement creates a new Purchase Request and may reference the original request.
- Urgent Purchase is a lightweight exception recorded in project Purchase history without the full sourcing and approval flow.
- Post-facto approval rules and financial limits are deferred.

## Documents

Documents remain in Google Drive or Google Sheets for V1. ERP stores manually entered links for material lists, requirements, supplier quotations, comparisons, supplier POs, urgent-payment screenshots, and related purchase documents. The prototype does not parse spreadsheets or extract line items.

## Future visibility

- Purchase team sees all Purchase Requests.
- PM sees requests for their projects.
- Production sees relevant Production-purpose requests.
- Site/Execution sees relevant Site-purpose requests.
- Management sees approval and summary information.

Authentication and security enforcement are not implemented in the prototype.

Placeholders and fictional records must not be treated as approved GDS business rules.
