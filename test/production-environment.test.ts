import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { REQUIRED_PRODUCTION_ENV_NAMES } from "@/constants/environment";
import { getProductionEnvironmentIssues } from "@/functions/environment/get-production-environment-issues";
import type { EnvironmentValues } from "@/types/environment";

const { privateKey: muxSigningPrivateKey } = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const validEnvironment = {
  AUTH_SECRET: "a-secure-auth-secret-with-more-than-32-characters",
  DATABASE_URL: "postgresql://user:password@db.example.com:6543/platform",
  DIRECT_URL: "postgresql://user:password@db.example.com:5432/platform",
  EMAIL_FROM: "Umberto Iglina <access@mail.umbertoiglina.it>",
  MUX_SIGNING_KEY_ID: "mux-signing-key",
  MUX_SIGNING_PRIVATE_KEY: muxSigningPrivateKey.replaceAll("\n", "\\n"),
  MUX_TOKEN_ID: "mux-token-id",
  MUX_TOKEN_SECRET: "mux-token-secret",
  MUX_WEBHOOK_SECRET: "mux-webhook-secret",
  NEXTAUTH_URL: "https://courses.example.com",
  NEXT_PUBLIC_APP_URL: "https://courses.example.com",
  RESEND_API_KEY: "re_test",
  STRIPE_SECRET_KEY: "sk_test_secret",
  STRIPE_WEBHOOK_SECRET: "whsec_secret",
  SUPABASE_SERVICE_ROLE_KEY: "supabase-service-role-key",
  SUPABASE_URL: "https://project.supabase.co",
} satisfies EnvironmentValues;

describe("getProductionEnvironmentIssues", () => {
  it("accepts a complete production environment", () => {
    expect(getProductionEnvironmentIssues(validEnvironment)).toEqual([]);
  });

  it("accepts the Base64-encoded PEM returned by Mux", () => {
    const environment = {
      ...validEnvironment,
      MUX_SIGNING_PRIVATE_KEY: Buffer.from(muxSigningPrivateKey).toString(
        "base64"
      ),
    };

    expect(getProductionEnvironmentIssues(environment)).toEqual([]);
  });

  it.each([
    "Platform <onboarding@resend.dev>",
    "Platform <ACCESS@MAIL.RESEND.DEV>",
    "Platform <access@example.com>",
    "Platform <access@mail.example.org>",
    "Platform <access@project.test>",
  ])("rejects the non-production sender %s", (emailFrom) => {
    const environment = { ...validEnvironment, EMAIL_FROM: emailFrom };

    expect(getProductionEnvironmentIssues(environment)).toContainEqual({
      name: "EMAIL_FROM",
      reason: "must not use a sandbox or placeholder domain",
    });
  });

  it("reports all missing variables", () => {
    const issues = getProductionEnvironmentIssues({});

    expect(issues).toHaveLength(REQUIRED_PRODUCTION_ENV_NAMES.length);
    expect(issues.map(({ name }) => name)).toEqual(
      expect.arrayContaining([...REQUIRED_PRODUCTION_ENV_NAMES])
    );
  });

  it("rejects a local application origin", () => {
    const environment = {
      ...validEnvironment,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };

    expect(getProductionEnvironmentIssues(environment)).toEqual(
      expect.arrayContaining([
        {
          name: "NEXT_PUBLIC_APP_URL",
          reason: "must be a public HTTPS origin",
        },
      ])
    );
  });

  it("rejects mismatched application origins", () => {
    const environment = {
      ...validEnvironment,
      NEXTAUTH_URL: "https://auth.example.com",
    };

    expect(getProductionEnvironmentIssues(environment)).toContainEqual({
      name: "NEXTAUTH_URL",
      reason: "must match NEXT_PUBLIC_APP_URL",
    });
  });

  it("validates database, provider and signing-key formats", () => {
    const environment = {
      ...validEnvironment,
      DATABASE_URL: "https://db.example.com",
      DIRECT_URL: "https://db.example.com",
      EMAIL_FROM: "invalid-address",
      MUX_SIGNING_PRIVATE_KEY: "invalid-key",
      RESEND_API_KEY: "invalid",
      STRIPE_WEBHOOK_SECRET: "invalid",
    };

    expect(getProductionEnvironmentIssues(environment)).toEqual(
      expect.arrayContaining([
        { name: "DATABASE_URL", reason: "must use the postgres protocol" },
        { name: "DIRECT_URL", reason: "must use the postgres protocol" },
        {
          name: "EMAIL_FROM",
          reason: "must contain a valid email address",
        },
        {
          name: "MUX_SIGNING_PRIVATE_KEY",
          reason: "must be a valid RSA private key",
        },
        { name: "RESEND_API_KEY", reason: "must start with re_" },
        {
          name: "STRIPE_WEBHOOK_SECRET",
          reason: "must start with whsec_",
        },
      ])
    );
  });

  it("reports only the syntax issue for a malformed sender", () => {
    const issues = getProductionEnvironmentIssues({
      ...validEnvironment,
      EMAIL_FROM: "invalid-address",
    }).filter(({ name }) => name === "EMAIL_FROM");

    expect(issues).toEqual([
      {
        name: "EMAIL_FROM",
        reason: "must contain a valid email address",
      },
    ]);
  });

  it("rejects local or pooled migration database connections", () => {
    const environment = {
      ...validEnvironment,
      DATABASE_URL: "postgresql://user:password@localhost:5432/platform",
      DIRECT_URL:
        "postgresql://user:password@db.example.com:6543/platform?pgbouncer=true",
    };

    expect(getProductionEnvironmentIssues(environment)).toEqual(
      expect.arrayContaining([
        {
          name: "DATABASE_URL",
          reason: "must use a remote database host",
        },
        {
          name: "DIRECT_URL",
          reason: "must not use a PgBouncer connection",
        },
      ])
    );
  });

  it("does not expose environment values in validation issues", () => {
    const secretValue = "secret-that-must-not-appear";
    const environment = {
      ...validEnvironment,
      RESEND_API_KEY: secretValue,
    };

    const serializedIssues = JSON.stringify(
      getProductionEnvironmentIssues(environment)
    );

    expect(serializedIssues).not.toContain(secretValue);
  });

  it("keeps .env.example aligned with runtime and migration variables", () => {
    const example = readFileSync(resolve(process.cwd(), ".env.example"), "utf8");
    const documentedNames = [
      ...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm),
    ].map((match) => match[1]);
    const expectedNames = [...REQUIRED_PRODUCTION_ENV_NAMES];

    expect(documentedNames.sort()).toEqual(expectedNames.sort());
  });
});
