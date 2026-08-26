import Mux from "@mux/mux-node";

import { createDatabaseScriptClient } from "@/functions/scripts/create-database-script-client";
import { requireScriptEnv } from "@/functions/scripts/require-script-env";
import type { ScriptClientsOptions } from "@/types/scripts";

export function createScriptClients({
  requireMuxSigning = false,
}: ScriptClientsOptions = {}) {
  if (requireMuxSigning) {
    requireScriptEnv("MUX_SIGNING_KEY_ID");
    requireScriptEnv("MUX_SIGNING_PRIVATE_KEY");
  }

  const tokenId = requireScriptEnv("MUX_TOKEN_ID");
  const tokenSecret = requireScriptEnv("MUX_TOKEN_SECRET");
  const mux = new Mux({ tokenId, tokenSecret });
  const { pool, prisma } = createDatabaseScriptClient();

  return { mux, pool, prisma };
}
