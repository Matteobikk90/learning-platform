import { Prisma } from "@prisma/client";

export function isCourseDeleteRestrictedError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}
