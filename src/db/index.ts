import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for server-side database access.");
}

const globalForDatabase = globalThis as unknown as {
  gdsPostgresClient?: ReturnType<typeof postgres>;
};

export const sql =
  globalForDatabase.gdsPostgresClient ??
  postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.gdsPostgresClient = sql;
}

export const db = drizzle(sql, { schema });

export async function checkDatabaseConnection() {
  const result = await sql<{ ok: number }[]>`select 1 as ok`;
  return Number(result[0]?.ok) === 1;
}

export async function closeDatabaseConnection() {
  await sql.end({ timeout: 5 });
}
