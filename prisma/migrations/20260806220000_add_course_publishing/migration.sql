ALTER TABLE "Course"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Course"
SET "isPublished" =
  EXISTS (
    SELECT 1
    FROM "Module"
    WHERE "Module"."courseId" = "Course"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Module"
    WHERE "Module"."courseId" = "Course"."id"
      AND "Module"."videoPlaybackId" IS NULL
  );
