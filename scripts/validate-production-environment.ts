import "dotenv/config";

import { getProductionEnvironmentIssues } from "@/functions/environment/get-production-environment-issues";
import { isVercelProduction } from "@/functions/environment/is-vercel-production";

const vercelProductionOnly = process.argv.includes("--vercel-production");

if (vercelProductionOnly && !isVercelProduction(process.env)) {
  console.log("Production environment validation skipped outside Vercel production.");
  process.exit(0);
}

const issues = getProductionEnvironmentIssues(process.env);

if (issues.length > 0) {
  console.error("Production environment validation failed:");
  for (const issue of issues) {
    console.error(`- ${issue.name}: ${issue.reason}`);
  }
  process.exitCode = 1;
} else {
  console.log("Production environment validation passed.");
}
