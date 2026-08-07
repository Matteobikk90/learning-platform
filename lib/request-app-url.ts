import "server-only";

import { resolveRequestOrigin } from "@/functions/environment/resolve-request-origin";
import { getAppUrl } from "@/lib/env";
import { headers } from "next/headers";

export async function getRequestAppUrl() {
  return resolveRequestOrigin(await headers()) || getAppUrl();
}
