# Payment V1

## Flow

Billing → Payment Pending → Partially Received → Received → Ready to Close

## Scope

- Payment is lightweight project-level tracking of amount received and received date.
- Total Billed comes from existing project bills.
- Payment status and pending amount are derived from billed and received amounts.
- Ready to Close is derived only; it does not close the project.

## Deferred

- Detailed Accounts and Finance workflows are deferred.
- Tally integration is deferred.
- The project closure action is deferred.
