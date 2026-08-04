import "server-only";

import { getOptionalEnv } from "@/lib/env";
import type { MuxSigningCredentials } from "@/types/mux";

export function getMuxSigningCredentials(): MuxSigningCredentials | null {
  const keyId = getOptionalEnv("MUX_SIGNING_KEY_ID");
  const rawKey = getOptionalEnv("MUX_SIGNING_PRIVATE_KEY");

  if (Boolean(keyId) !== Boolean(rawKey)) {
    throw new Error(
      "MUX_SIGNING_KEY_ID e MUX_SIGNING_PRIVATE_KEY devono essere configurati insieme"
    );
  }

  return rawKey
    ? { keyId: keyId!, keySecret: rawKey.replaceAll("\\n", "\n") }
    : null;
}
