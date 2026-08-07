import type { AdminPageHrefInput } from "@/types/admin";

export function getAdminPageHref({
  basePath,
  page,
  query,
}: AdminPageHrefInput): string {
  const searchParams = new URLSearchParams({ page: String(page) });

  if (query) searchParams.set("q", query);

  return `${basePath}?${searchParams.toString()}`;
}
