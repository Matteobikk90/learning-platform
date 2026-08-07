import { APP_URL_PROTOCOLS } from "@/constants/environment";
import type { HeaderReader } from "@/types/environment";

export function resolveRequestOrigin(headers: HeaderReader) {
  const origin = headers.get("origin");
  const host = getFirstHeaderValue(
    headers.get("x-forwarded-host") || headers.get("host")
  );

  if (!origin || !host) return undefined;

  try {
    const url = new URL(origin);

    if (
      !APP_URL_PROTOCOLS.has(url.protocol) ||
      url.host.toLowerCase() !== host.toLowerCase()
    ) {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim();
}
