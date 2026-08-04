CREATE TYPE "MuxPlaybackPolicy" AS ENUM ('PUBLIC', 'SIGNED');

ALTER TABLE "Module"
ADD COLUMN "videoPlaybackPolicy" "MuxPlaybackPolicy" NOT NULL DEFAULT 'PUBLIC';

ALTER TABLE "ModuleProgress"
ADD COLUMN "watchedSeconds" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
