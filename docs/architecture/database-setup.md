# Database Setup

## Foundation

- Database: Supabase PostgreSQL
- Region: Mumbai (`ap-south-1`)
- Application access: Drizzle ORM with postgres.js
- Runtime connection: Supabase shared pooler
- Schema status: project foundation (`financial_years`, `internal_users`, `projects`)

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
pnpm db:init:project-foundation
```

- `db:check` performs server-side `SELECT 1` and prints only success or failure.
- `db:generate` creates migration files from reviewed schema changes; it does not apply them.
- `db:migrate` applies reviewed migration files.
- `db:studio` opens Drizzle Studio for an approved development database.
- `db:init:project-foundation` idempotently initializes FY 2026-27 and the six approved internal users. It does not create projects.

No schema command should be run against production without review and explicit approval.

## Migration connection considerations

`DATABASE_URL` currently uses Supabase's shared session-mode pooler on port 5432. The first reviewed migration was applied successfully through this connection. Transaction-mode pooler connections may not support every migration or Studio operation that relies on session-level behavior.

Drizzle CLI prefers `MIGRATION_DATABASE_URL` when present and otherwise falls back to `DATABASE_URL`. The current session-pooler connection supports the reviewed migration. If runtime access moves to transaction mode, obtain a Supabase direct or session-mode connection and store it privately as `MIGRATION_DATABASE_URL` before applying later migrations.

SSL is enforced by the runtime client and added to the Drizzle CLI connection configuration.

## Current project-foundation boundary

The first project-foundation migration contains only the three approved tables. Current follow-up boundaries are:

1. Confirm backup/restore procedures before production use.
2. Keep the prototype UI on mock data until a separate database-backed UI task is approved.
3. Add authentication and Row-Level Security before exposing tables directly to users.
4. Treat Client PO, Activity Log, and all later workflow tables as separate reviewed slices.

The broader proposed model remains in `docs/architecture/persistence-data-model.md`.
