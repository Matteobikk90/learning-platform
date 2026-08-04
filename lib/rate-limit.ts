import "server-only";

import { createHmac } from "node:crypto";

import { after } from "next/server";

import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

// Expired buckets reset on their next hit, so pruning is purely to keep the
// table from growing with one row per email/IP ever seen.
const PRUNE_GRACE_MS = 24 * 60 * 60 * 1000;

function pruneExpiredBuckets() {
  after(async () => {
    try {
      await prisma.rateLimitBucket.deleteMany({
        where: { resetAt: { lte: new Date(Date.now() - PRUNE_GRACE_MS) } },
      });
    } catch (error) {
      console.error("[rate-limit] Failed to prune expired buckets", error);
    }
  });
}

function privateBucketKey(scope: string, value: string) {
  return createHmac("sha256", requireEnv("AUTH_SECRET"))
    .update(`${scope}:${value.trim().toLowerCase()}`)
    .digest("hex");
}

export async function consumeRateLimit({
  scope,
  value,
  limit,
  windowSeconds,
}: {
  scope: string;
  value: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const key = privateBucketKey(scope, value);
  const resetAt = new Date(Date.now() + windowSeconds * 1000);

  const [bucket] = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${resetAt}, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;

  if (!bucket) {
    throw new Error("Impossibile verificare il limite richieste");
  }

  pruneExpiredBuckets();

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000)
    ),
  };
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
