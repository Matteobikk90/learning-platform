export type ServerEnvName =
  | "ALLOW_RESEND_SANDBOX_EMAILS"
  | "AUTH_SECRET"
  | "DATABASE_URL"
  | "DIRECT_URL"
  | "EMAIL_FROM"
  | "MUX_SIGNING_KEY_ID"
  | "MUX_SIGNING_PRIVATE_KEY"
  | "MUX_TOKEN_ID"
  | "MUX_TOKEN_SECRET"
  | "MUX_WEBHOOK_SECRET"
  | "NEXTAUTH_URL"
  | "NEXT_PUBLIC_APP_URL"
  | "RESEND_API_KEY"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_URL"
  | "VERCEL_ENV"
  | "VERCEL_PROJECT_PRODUCTION_URL"
  | "VERCEL_URL";

export type AppUrlEnvironment = {
  configuredUrl: string;
  vercelEnvironment?: string;
  vercelProductionUrl?: string;
  vercelUrl?: string;
};

export type HeaderReader = {
  get(name: string): string | null;
};

export type EnvironmentValues = Readonly<
  Record<string, string | undefined>
>;

export type EnvironmentValidationIssue = {
  name: ServerEnvName;
  reason: string;
};
