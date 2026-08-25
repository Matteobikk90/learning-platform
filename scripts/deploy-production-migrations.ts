import "dotenv/config";

import { runProductionMigrations } from "@/functions/scripts/run-production-migrations";

try {
  const result = runProductionMigrations(process.env);

  console.log(
    result === "applied"
      ? "Production database migrations applied."
      : "Production database migrations skipped outside Vercel production."
  );
} catch (error) {
  console.error(
    "Production database migration failed:",
    error instanceof Error ? error.message : "unknown error"
  );
  process.exitCode = 1;
}
