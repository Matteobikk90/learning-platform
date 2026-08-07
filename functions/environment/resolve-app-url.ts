import {
  APP_URL_PROTOCOLS,
  LOCAL_APP_HOSTNAMES,
} from "@/constants/environment";
import type { AppUrlEnvironment } from "@/types/environment";

export function resolveAppUrl({
  configuredUrl,
  vercelEnvironment,
  vercelProductionUrl,
  vercelUrl,
}: AppUrlEnvironment) {
  const appUrl = normalizeAppUrl(configuredUrl);

  if (!LOCAL_APP_HOSTNAMES.has(new URL(appUrl).hostname)) {
    return appUrl;
  }

  const vercelHost =
    vercelEnvironment === "preview"
      ? vercelUrl || vercelProductionUrl
      : vercelProductionUrl || vercelUrl;

  return vercelHost
    ? normalizeAppUrl(toHttpsUrl(vercelHost))
    : appUrl;
}

function normalizeAppUrl(value: string) {
  const url = new URL(value);

  if (
    !APP_URL_PROTOCOLS.has(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Application URL must be an HTTP(S) origin");
  }

  return url.origin;
}

function toHttpsUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
