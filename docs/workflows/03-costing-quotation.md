# Costing and Quotation

## Approved V1 workflow

Client Requirement / BOQ
→ Multiple Costing Entries
→ GDS Quotation V1
→ Revision V2/V3/etc.
→ Final Quotation

## Requirement / BOQ

- Each project has at most one editable requirement summary.
- The received date, Google Drive/Sheets link, and scope notes are optional.
- Costing status is `Not Started`, `In Progress`, `Awaiting Cost`, or `Costing Complete`.

## Costing entries

- A project may have zero, one, or many entries, including multiple entries for the same work category.
- Source is `Internal` or `Vendor`; vendor/party is optional and available for vendor entries.
- Cost amounts must be positive.
- Status is `Awaiting`, `Received`, `Finalised`, or `Cancelled`.
- Cancelled entries remain in history and do not contribute to active summaries.
- No entry is automatically selected or treated as the final project cost.

## Quotation versions

- Versions are project-specific and assigned by the server as V1, V2, V3, and so on.
- A Draft may be edited. Submitted and Final commercial values are preserved.
- Creating a revision preserves the prior record and supersedes the previous current version.
- Only one version per project may be Final at a time. Making a newer version Final supersedes the previous Final.

## System boundary

- Detailed BOQs, calculations, rate sheets, and quotation documents remain in Google Drive or Google Sheets.
- ERP stores workflow information, links, costing amounts, quotation amounts, and quotation history.
- Active entry count, recorded costing amount, latest quotation, and final quotation value are derived.
- Recorded costing amount is not the final project cost; alternative/internal/vendor entries may overlap.
- Profit, margin, actual project cost, variance, vendor savings, native calculations, document uploads, and sending quotations are deferred.
- Costing and quotation activity does not change project status, lifecycle, Job Code, or financial-year sequence.

## Work categories

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
