import { createPrivateKey } from "node:crypto";

import {
  LOCAL_APP_HOSTNAMES,
  NON_PRODUCTION_EMAIL_DOMAIN_SUFFIXES,
  NON_PRODUCTION_EMAIL_DOMAINS,
  REQUIRED_PRODUCTION_ENV_NAMES,
  RESEND_SANDBOX_EMAIL_ADDRESS,
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
  const directUrl = parseUrl("DIRECT_URL", value("DIRECT_URL"), issues);

  validateDatabaseUrl("DATABASE_URL", databaseUrl, addIssue);
  validateDatabaseUrl("DIRECT_URL", directUrl, addIssue);

  if (
    directUrl?.searchParams.get("pgbouncer")?.toLowerCase() === "true"
  ) {
    addIssue("DIRECT_URL", "must not use a PgBouncer connection");
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
  validateEmailFrom(
    value("EMAIL_FROM"),
    value("ALLOW_RESEND_SANDBOX_EMAILS") === "true",
    addIssue
  );
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
  allowResendSandboxEmails: boolean,
  addIssue: (name: ServerEnvName, reason: string) => void
) {
  if (!value) return;

  const address = value.match(/<([^<>]+)>$/)?.[1] ?? value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    addIssue("EMAIL_FROM", "must contain a valid email address");
    return;
  }

  const domain = address.slice(address.lastIndexOf("@") + 1).toLowerCase();
  const isAllowedResendSandboxSender =
    allowResendSandboxEmails &&
    address.toLowerCase() === RESEND_SANDBOX_EMAIL_ADDRESS;
  const isNonProductionDomain = [...NON_PRODUCTION_EMAIL_DOMAINS].some(
    (blockedDomain) =>
      domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)
  ) ||
    NON_PRODUCTION_EMAIL_DOMAIN_SUFFIXES.some((suffix) =>
      domain.endsWith(suffix)
    );

  if (isNonProductionDomain && !isAllowedResendSandboxSender) {
    addIssue("EMAIL_FROM", "must not use a sandbox or placeholder domain");
  }
}

function validateDatabaseUrl(
  name: "DATABASE_URL" | "DIRECT_URL",
  url: URL | null,
  addIssue: (name: ServerEnvName, reason: string) => void
) {
  if (!url) return;

  if (!POSTGRES_PROTOCOLS.has(url.protocol)) {
    addIssue(name, "must use the postgres protocol");
  } else if (LOCAL_APP_HOSTNAMES.has(url.hostname)) {
    addIssue(name, "must use a remote database host");
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

  const candidates = [
    value.replaceAll("\\n", "\n"),
    Buffer.from(value, "base64").toString("utf8"),
  ];
  const hasValidRsaKey = candidates.some((candidate) => {
    try {
      return createPrivateKey(candidate).asymmetricKeyType === "rsa";
    } catch {
      return false;
    }
  });

  if (!hasValidRsaKey) {
    addIssue("MUX_SIGNING_PRIVATE_KEY", "must be a valid RSA private key");
  }
}
