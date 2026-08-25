import { createPrivateKey } from "node:crypto";

import {
  LOCAL_APP_HOSTNAMES,
  REQUIRED_PRODUCTION_ENV_NAMES,
} from "@/constants/environment";
import type {
  EnvironmentValidationIssue,
  EnvironmentValues,
  ServerEnvName,
} from "@/types/environment";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

export function getProductionEnvironmentIssues(
  environment: EnvironmentValues
): EnvironmentValidationIssue[] {
  const issues: EnvironmentValidationIssue[] = [];
  const value = (name: ServerEnvName) => environment[name]?.trim();
  const addIssue = (name: ServerEnvName, reason: string) => {
    issues.push({ name, reason });
  };

  for (const name of REQUIRED_PRODUCTION_ENV_NAMES) {
    if (!value(name)) addIssue(name, "missing");
  }

  const authSecret = value("AUTH_SECRET");
  if (authSecret && authSecret.length < 32) {
    addIssue("AUTH_SECRET", "must contain at least 32 characters");
  }

  const databaseUrl = parseUrl("DATABASE_URL", value("DATABASE_URL"), issues);

  if (databaseUrl && !POSTGRES_PROTOCOLS.has(databaseUrl.protocol)) {
    addIssue("DATABASE_URL", "must use the postgres protocol");
  }

  const nextAuthUrl = parseProductionOrigin(
    "NEXTAUTH_URL",
    value("NEXTAUTH_URL"),
    issues
  );
  const appUrl = parseProductionOrigin(
    "NEXT_PUBLIC_APP_URL",
    value("NEXT_PUBLIC_APP_URL"),
    issues
  );

  if (nextAuthUrl && appUrl && nextAuthUrl.origin !== appUrl.origin) {
    addIssue("NEXTAUTH_URL", "must match NEXT_PUBLIC_APP_URL");
  }

  parseProductionOrigin("SUPABASE_URL", value("SUPABASE_URL"), issues);
  validateEmailFrom(value("EMAIL_FROM"), addIssue);
  validatePrefix("RESEND_API_KEY", value("RESEND_API_KEY"), "re_", addIssue);
  validatePrefix(
    "STRIPE_SECRET_KEY",
    value("STRIPE_SECRET_KEY"),
    "sk_",
    addIssue
  );
  validatePrefix(
    "STRIPE_WEBHOOK_SECRET",
    value("STRIPE_WEBHOOK_SECRET"),
    "whsec_",
    addIssue
  );

  validateMuxSigningKey(value("MUX_SIGNING_PRIVATE_KEY"), addIssue);

  return issues;
}

function parseUrl(
  name: ServerEnvName,
  value: string | undefined,
  issues: EnvironmentValidationIssue[]
) {
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    issues.push({ name, reason: "must be a valid URL" });
    return null;
  }
}

function parseProductionOrigin(
  name: ServerEnvName,
  value: string | undefined,
  issues: EnvironmentValidationIssue[]
) {
  const url = parseUrl(name, value, issues);
  if (!url) return null;

  if (
    url.protocol !== "https:" ||
    LOCAL_APP_HOSTNAMES.has(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    issues.push({ name, reason: "must be a public HTTPS origin" });
    return null;
  }

  return url;
}

function validateEmailFrom(
  value: string | undefined,
  addIssue: (name: ServerEnvName, reason: string) => void
) {
  if (!value) return;

  const address = value.match(/<([^<>]+)>$/)?.[1] ?? value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    addIssue("EMAIL_FROM", "must contain a valid email address");
  }
}

function validatePrefix(
  name: ServerEnvName,
  value: string | undefined,
  prefix: string,
  addIssue: (name: ServerEnvName, reason: string) => void
) {
  if (value && !value.startsWith(prefix)) {
    addIssue(name, `must start with ${prefix}`);
  }
}

function validateMuxSigningKey(
  value: string | undefined,
  addIssue: (name: ServerEnvName, reason: string) => void
) {
  if (!value) return;

  try {
    const key = createPrivateKey(value.replaceAll("\\n", "\n"));
    if (key.asymmetricKeyType !== "rsa") throw new Error();
  } catch {
    addIssue("MUX_SIGNING_PRIVATE_KEY", "must be a valid RSA private key");
  }
}
