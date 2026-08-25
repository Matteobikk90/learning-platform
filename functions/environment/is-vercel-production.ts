import type { EnvironmentValues } from "@/types/environment";

export function isVercelProduction(environment: EnvironmentValues) {
  return environment.VERCEL_ENV?.trim() === "production";
}
