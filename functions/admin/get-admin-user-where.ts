import type { Prisma } from "@prisma/client";

export function getAdminUserWhere(query: string): Prisma.UserWhereInput {
  if (!query) return {};

  return {
    OR: [
      { email: { contains: query, mode: "insensitive" } },
      { name: { contains: query, mode: "insensitive" } },
    ],
  };
}
