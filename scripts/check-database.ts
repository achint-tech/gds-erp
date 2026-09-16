import { config as loadEnvironment } from "dotenv";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ path: ".env", quiet: true });

async function main() {
  const { checkDatabaseConnection, closeDatabaseConnection } =
    await import("../src/db/index");

  try {
    const connected = await checkDatabaseConnection();
    if (!connected) throw new Error("Database connectivity check failed.");
    console.log("Database connectivity check succeeded (SELECT 1).");
  } finally {
    await closeDatabaseConnection();
  }
}

void main().catch(() => {
  console.error(
    "Database connectivity check failed. Verify the private database URL and credentials.",
  );
  process.exitCode = 1;
});
