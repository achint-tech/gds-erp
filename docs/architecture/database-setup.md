# Database Setup

## Foundation

- Database: Supabase PostgreSQL
- Region: Mumbai (`ap-south-1`)
- Application access: Drizzle ORM with postgres.js
- Runtime connection: Supabase shared transaction-mode pooler
- Schema status: intentionally empty until Phase 1B

Database access is server-only. The runtime client reads `DATABASE_URL`, requires SSL, disables prepared statements with `prepare: false`, and limits each application instance to one connection with `max: 1`.

Never expose a database URL through `NEXT_PUBLIC_*`, client components, logs, fixtures, or committed files.

## Environment variables

```text
DATABASE_URL=private Supabase transaction-pooler connection
MIGRATION_DATABASE_URL=optional direct or session-mode migration connection
```

Next.js loads `.env.local` for the application. Drizzle configuration and the connectivity script load `.env.local` explicitly. Environment variables already present in the process take precedence.

`.env.local` remains Git-ignored. Do not place real values in documentation or `.env.example`.

## Commands

```shell
pnpm db:check
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

- `db:check` performs server-side `SELECT 1` and prints only success or failure.
- `db:generate` creates migration files from reviewed schema changes; it does not apply them.
- `db:migrate` applies reviewed migration files.
- `db:studio` opens Drizzle Studio for an approved development database.

No schema command should be run against production without review and explicit approval.

## Migration connection considerations

`DATABASE_URL` currently uses Supabase's shared transaction-mode pooler. It is appropriate for short-lived application queries when postgres.js uses `prepare: false`, but transaction pooling may not support every migration or Studio operation that relies on session-level behavior.

Drizzle CLI prefers `MIGRATION_DATABASE_URL` when present and otherwise falls back to `DATABASE_URL`. Before the first real migration, verify Drizzle Kit against the pooler. If it is unsuitable, obtain a Supabase direct or session-mode connection and store it privately as `MIGRATION_DATABASE_URL`. No separate credential is required during this foundation-only phase because no migration is being applied.

SSL is enforced by the runtime client and added to the Drizzle CLI connection configuration.

## Phase 1B boundary

Phase 1B begins only after schema review. Its remaining work is:

1. Confirm the migration connection strategy and backup/restore procedure.
2. Add reviewed schemas for `financial_years`, `internal_users`, `projects`, `client_purchase_orders`, and `activity_log`.
3. Generate, inspect, and approve the first migration.
4. Apply it to an approved non-production environment.
5. Add transactional Job Code reservation and Draft activation services.
6. Add database constraints, server-side tests, and Row-Level Security policies before exposing tables.

The broader proposed model remains in `docs/architecture/persistence-data-model.md`.
