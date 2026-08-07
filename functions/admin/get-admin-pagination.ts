import type {
  AdminPaginationInput,
  AdminPaginationResult,
} from "@/types/admin";

export function getAdminPagination({
  itemCount,
  pageSize,
  requestedPage,
}: AdminPaginationInput): AdminPaginationResult {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("pageSize must be a positive safe integer");
  }

  const safeItemCount =
    Number.isSafeInteger(itemCount) && itemCount >= 0 ? itemCount : 0;
  const safeRequestedPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const totalPages = Math.max(1, Math.ceil(safeItemCount / pageSize));
  const currentPage = Math.min(safeRequestedPage, totalPages);

  return {
    currentPage,
    skip: (currentPage - 1) * pageSize,
    totalPages,
  };
}
