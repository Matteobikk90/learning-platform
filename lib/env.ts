import "server-only";

type ServerEnvName =
  | "AUTH_SECRET"
  | "DATABASE_URL"
  | "EMAIL_FROM"
  | "MUX_TOKEN_ID"
  | "MUX_TOKEN_SECRET"
  | "MUX_WEBHOOK_SECRET"
  | "MUX_SIGNING_KEY_ID"
  | "MUX_SIGNING_PRIVATE_KEY"
  | "NEXTAUTH_URL"
  | "NEXT_PUBLIC_APP_URL"
  | "RESEND_API_KEY"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_URL";

export function requireEnv(name: ServerEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppUrl(): string {
  const url = new URL(requireEnv("NEXT_PUBLIC_APP_URL"));
  return url.toString().replace(/\/$/, "");
}

export function getOptionalEnv(name: ServerEnvName): string | undefined {
  return process.env[name]?.trim() || undefined;
}
