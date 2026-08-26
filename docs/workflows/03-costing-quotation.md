# Pre-PO Costing and Quotation

## Approved V1 workflow

Client BOQ / Requirement
→ PM initiates costing
→ Internal Production / Vendor / Both
→ Costing received
→ Internal review
→ Final costing
→ Quotation prepared
→ Quotation sent
→ Revision / Negotiation
→ PO awaited

## V1 system boundary

- A Costing Source may cover one or more Work Categories. Multiple costing sources may cover the same Work Category, and internal and vendor costing may coexist for the same category.
- Approved Project Managers: Anumeha, Sachin, Neeraj.
- The full Costing & Quotation workspace is displayed only within its dedicated project section. Project Overview contains only a compact commercial summary.
- Project Type determines the default/recommended Costing Work Categories presented in the UI. The underlying costing model remains flexible, and additional categories may be added when required.
- Costing calculations remain in existing Google Sheets for V1.
- GDS ERP stores and organises manually entered links to client BOQs, internal production costing, vendor costing, final costing, and quotation versions.
- Native costing calculations and document attachments are deferred.
- Google authentication, Google APIs, uploads, persistence, vendor master data, purchase workflow, and PO-to-project conversion are not implemented.
- Prototype interactions use local state only and do not persist changes.

Placeholders and fictional prototype records must not be treated as approved GDS business rules.

## Default Work Categories by Project Type

### Fixtures

- Fixtures
- Metal Fixtures

Additional categories may be revealed when required. Internal Production is the default Source Type selection in the prototype UI.

### SIS

- Fixtures
- Metal Fixtures
- Signage / Branding
- Installation
- Logistics

Additional categories may be revealed when required. Internal Production remains a prominent available Source Type.

### Turnkey

- Civil
- Electrical
- HVAC
- Fire
- Fixtures
- Metal Fixtures
- Signage / Branding
- MEP
- Flooring
- Ceiling
- Painting
- Plumbing
- Installation
- Logistics
- Other

### Civil

- Civil
- Electrical
- HVAC
- Fire
- MEP
- Flooring
- Ceiling
- Painting
- Plumbing
- Installation
- Logistics
- Other

Fixtures and Metal Fixtures may be revealed as additional categories when required.
