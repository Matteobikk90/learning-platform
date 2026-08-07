import { ADMIN_USER_SEARCH_MAX_LENGTH } from "@/constants/admin";

export function normalizeAdminSearch(value?: string | string[]): string {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, ADMIN_USER_SEARCH_MAX_LENGTH);
}
