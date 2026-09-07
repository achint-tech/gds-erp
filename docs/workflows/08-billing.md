# Billing V1

## Flow

Billing Ready → Final Bill / Additional Bill → Raised → Submitted → Approved

## Scope

- A project may contain multiple Final Bill or Additional Bill records.
- Each bill stores only its type, number, date, amount and manually selected status.
- Total Billed and Bill Count are derived from the project bill records.
- Billing Readiness is inherited from Site Execution and is not manually controlled.

## Deferred

- Payment is deferred.
- Accounts and Finance workflows are deferred.
- Tally integration is deferred.
