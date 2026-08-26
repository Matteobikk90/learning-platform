import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { requireScriptEnv } from "@/functions/scripts/require-script-env";

export function createDatabaseScriptClient() {
  const pool = new Pool({
    connectionString: requireScriptEnv("DATABASE_URL"),
    max: 2,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  return { pool, prisma };
}
