CREATE TYPE "CheckoutAttemptStatus" AS ENUM (
  'CREATING',
  'OPEN',
  'PROCESSING',
  'COMPLETED',
  'EXPIRED',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE "CheckoutAttempt" (
  "id" TEXT NOT NULL,
  "activeKey" TEXT,
  "status" "CheckoutAttemptStatus" NOT NULL DEFAULT 'CREATING',
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "amountTotal" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "checkoutLocale" TEXT NOT NULL,
  "legalTermsVersion" TEXT NOT NULL,
  "consentedAt" TIMESTAMP(3) NOT NULL,
  "courseTitle" TEXT NOT NULL,
  "courseDescription" TEXT,
  "successUrl" TEXT NOT NULL,
  "cancelUrl" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeCheckoutSessionId" TEXT,
  "stripeCheckoutUrl" TEXT,
  "stripeExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CheckoutAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CheckoutAttempt_activeKey_key"
ON "CheckoutAttempt"("activeKey");

CREATE UNIQUE INDEX "CheckoutAttempt_stripeCheckoutSessionId_key"
ON "CheckoutAttempt"("stripeCheckoutSessionId");

CREATE INDEX "CheckoutAttempt_userId_courseId_createdAt_idx"
ON "CheckoutAttempt"("userId", "courseId", "createdAt");

CREATE INDEX "CheckoutAttempt_status_stripeExpiresAt_idx"
ON "CheckoutAttempt"("status", "stripeExpiresAt");

ALTER TABLE "CheckoutAttempt"
ADD CONSTRAINT "CheckoutAttempt_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CheckoutAttempt"
ADD CONSTRAINT "CheckoutAttempt_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
