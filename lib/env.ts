import "server-only";

import { resolveAppUrl } from "@/functions/environment/resolve-app-url";
import type { ServerEnvName } from "@/types/environment";

export function requireEnv(name: ServerEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppUrl(): string {
  return resolveAppUrl({
    configuredUrl: requireEnv("NEXT_PUBLIC_APP_URL"),
    vercelEnvironment: getOptionalEnv("VERCEL_ENV"),
    vercelProductionUrl: getOptionalEnv("VERCEL_PROJECT_PRODUCTION_URL"),
    vercelUrl: getOptionalEnv("VERCEL_URL"),
  });
}

export function getOptionalEnv(name: ServerEnvName): string | undefined {
  return process.env[name]?.trim() || undefined;
}
