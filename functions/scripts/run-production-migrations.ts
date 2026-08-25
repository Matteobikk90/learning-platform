import { spawnSync } from "node:child_process";

import { isVercelProduction } from "@/functions/environment/is-vercel-production";
import type { EnvironmentValues } from "@/types/environment";
import type {
  ProductionMigrationCommand,
  ProductionMigrationResult,
} from "@/types/scripts";

export function runProductionMigrations(
  environment: EnvironmentValues,
  runMigration: ProductionMigrationCommand = runPrismaMigration
): ProductionMigrationResult {
  if (!isVercelProduction(environment)) return "skipped";

  const result = runMigration();

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `prisma migrate deploy exited with status ${result.status ?? "unknown"}`
    );
  }

  return "applied";
}

function runPrismaMigration() {
  return spawnSync("prisma", ["migrate", "deploy"], {
    stdio: "inherit",
  });
}
