import type { ServerEnvName } from "@/types/environment";

export const APP_URL_PROTOCOLS = new Set(["http:", "https:"]);

export const LOCAL_APP_HOSTNAMES = new Set([
  "[::1]",
  "127.0.0.1",
  "::1",
  "localhost",
]);

export const NON_PRODUCTION_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.net",
  "example.org",
  "resend.dev",
]);

export const NON_PRODUCTION_EMAIL_DOMAIN_SUFFIXES = [
  ".example",
  ".invalid",
  ".localhost",
  ".test",
];

export const REQUIRED_PRODUCTION_ENV_NAMES = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "EMAIL_FROM",
  "MUX_SIGNING_KEY_ID",
  "MUX_SIGNING_PRIVATE_KEY",
  "MUX_TOKEN_ID",
  "MUX_TOKEN_SECRET",
  "MUX_WEBHOOK_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
] as const satisfies readonly ServerEnvName[];
