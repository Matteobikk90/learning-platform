import Mux from "@mux/mux-node";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { requireScriptEnv } from "@/functions/scripts/require-script-env";
import type { ScriptClientsOptions } from "@/types/scripts";

export function createScriptClients({
  requireMuxSigning = false,
}: ScriptClientsOptions = {}) {
  if (requireMuxSigning) {
    requireScriptEnv("MUX_SIGNING_KEY_ID");
    requireScriptEnv("MUX_SIGNING_PRIVATE_KEY");
  }

  const mux = new Mux({
    tokenId: requireScriptEnv("MUX_TOKEN_ID"),
    tokenSecret: requireScriptEnv("MUX_TOKEN_SECRET"),
  });
  const pool = new Pool({
    connectionString: requireScriptEnv("DATABASE_URL"),
    max: 2,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  return { mux, pool, prisma };
}
