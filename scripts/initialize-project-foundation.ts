import { config as loadEnvironment } from "dotenv";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ path: ".env", quiet: true });

async function main() {
  const { sql, closeDatabaseConnection } = await import("../src/db");

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        insert into financial_years (
          label, starts_on, ends_on, next_job_number, is_current
        ) values (
          'FY 2026-27', '2026-04-01', '2027-03-31', 151, true
        )
        on conflict (label) do update set
          starts_on = excluded.starts_on,
          ends_on = excluded.ends_on,
          next_job_number = greatest(
            financial_years.next_job_number,
            excluded.next_job_number
          ),
          is_current = true,
          updated_at = now()
      `;

      await transaction`
        insert into internal_users (display_name, active, capabilities)
        values
          ('Manmohan Singh', true, array['project_lead']),
          ('Achint Kaur', true, array['project_lead']),
          ('Ikjot Singh', true, array['project_lead']),
          ('Anumeha', true, array['project_manager']),
          ('Sachin', true, array['project_manager']),
          ('Neeraj', true, array['project_manager'])
        on conflict (display_name) do nothing
      `;
    });

    console.log("Project foundation initialization completed.");
  } finally {
    await closeDatabaseConnection();
  }
}

void main().catch(() => {
  console.error(
    "Project foundation initialization failed. No credentials were logged.",
  );
  process.exitCode = 1;
});
