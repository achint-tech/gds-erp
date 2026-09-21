import { config as loadEnvironment } from "dotenv";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ path: ".env", quiet: true });

async function main() {
  const { sql, closeDatabaseConnection } = await import("../src/db/index");

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        insert into internal_users (display_name, active, capabilities)
        values
          ('Mouin', true, array['designer']::text[]),
          ('Azad', true, array['designer']::text[])
        on conflict (display_name) do update
        set capabilities = case
          when internal_users.capabilities @> array['designer']::text[]
            then internal_users.capabilities
          else array_append(internal_users.capabilities, 'designer')
        end,
        updated_at = now()
        where not internal_users.capabilities @> array['designer']::text[]
      `;
    });
    console.log("Design users initialized.");
  } finally {
    await closeDatabaseConnection();
  }
}

void main().catch(() => {
  console.error("Design user initialization failed.");
  process.exitCode = 1;
});
