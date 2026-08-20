# GDS ERP Repository Instructions

## Product context

- This repository contains the internal ERP for Global Display Systems.
- The initial product area is project management, project closure, archive and financial-year profitability.
- Approved documents under docs/ are the source of truth for business behaviour.

## Working rules

- Read relevant approved documentation before implementing a feature.
- Do not invent business rules, fields, statuses, formulas, roles or permissions.
- Record unresolved questions in docs/requirements/open-questions.md.
- Work on one bounded task at a time.
- Explain assumptions before implementing them.
- Do not modify an approved requirement merely to simplify implementation.
- Do not add production dependencies without explaining why they are required.
- Never commit secrets, credentials, private keys or production data.
- Never place real client data or confidential GDS documents in tests or fixtures.
- Do not deploy or modify production infrastructure without explicit approval.

## Technical rules

- Use TypeScript in strict mode.
- Use pnpm.
- Use database migrations for every schema change.
- Store timestamps in UTC.
- Store money using fixed-precision database types, never floating point.
- Store large files in object storage or approved Google Drive storage, not PostgreSQL.
- Enable and test Row-Level Security for every exposed database table.
- Enforce sensitive permissions on the server and database, not only in the UI.
- Maintain an audit trail for sensitive changes.
- Financially closed records must not be silently overwritten.
- Use approved adjustment and versioning workflows for post-closure changes.
- Add or update tests for every behavioural change.

## Verification

Before reporting implementation completion, run all checks available for the affected area, including:

- Formatting
- Lint
- Type checking
- Unit tests
- Integration tests
- Production build

Report:

- Files changed
- Assumptions
- Tests and checks run
- Any unresolved risks or questions

