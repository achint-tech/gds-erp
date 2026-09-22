# Bought-Out Purchase V1

## Scope

- Bought-Out Purchase covers finished project items purchased externally rather than manufactured by GDS.
- Production material procurement remains inside Production and is not part of this workflow.
- Each project has at most one Purchase workspace.
- The workspace stores an optional active internal-user owner, overall status, optional Google Sheet link, and notes.
- Status is `Not Started`, `In Progress`, `Ordering`, `Partially Received`, `Received`, or `Closed`.
- Detailed item, specification, quantity, vendor, rate, amount, PO, delivery, and remark data remains in the standardized Google Sheet.
- The ERP does not persist spreadsheet line items or derive the overall status from them.

## Google Sheet

- Only HTTPS `docs.google.com/spreadsheets` URLs are accepted.
- The original URL is preserved for opening the Sheet in a new tab.
- A supported URL may be converted to a restricted Google Sheets preview URL for viewing in the ERP.
- Embedding does not change sharing permissions; an unembeddable Sheet retains the external Edit Sheet action.
- Google APIs, OAuth, service accounts, public publishing, and synchronization are not used.

## Separation

- Purchase workspace changes do not change the Project, Client PO, Costing, Quotation, Design, Print, Production, Billing, Payment, Job Code, or financial-year sequence.
- Print Request linkage, supplier quotations, supplier POs, Vendor Master, payments, inventory, receipts, approvals, and detailed Purchase records are deferred.
