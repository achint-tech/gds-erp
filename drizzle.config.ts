import { config as loadEnvironment } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ path: ".env", quiet: true });

const rawDatabaseUrl =
  process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error(
    "MIGRATION_DATABASE_URL or DATABASE_URL is required for Drizzle CLI commands.",
  );
}

const migrationUrl = new URL(rawDatabaseUrl);
migrationUrl.searchParams.set("sslmode", "require");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: migrationUrl.toString(),
  },
  strict: true,
  verbose: true,
});
